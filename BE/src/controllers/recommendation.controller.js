// src/controllers/recommendation.controller.js
const Groq = require("groq-sdk");
const courseRepository = require('../repositories/course.repository');
const communityRepository = require('../repositories/community.repository');
const baseResponse = require('../utils/baseResponse.util');

// Inisialisasi Groq client
let groq;
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_')) {
    try {
        groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        console.log("Groq client initialized successfully.");
    } catch (initError) {
        console.error("Error initializing Groq client:", initError.message);
        groq = null;
    }
} else {
    if (!process.env.GROQ_API_KEY) {
        console.warn("GROQ_API_KEY tidak ditemukan di environment variables.");
    } else {
        console.warn("GROQ_API_KEY tampaknya tidak valid (tidak dimulai dengan 'gsk_').");
    }
    console.warn("Fitur rekomendasi AI tidak akan berfungsi.");
    groq = null;
}

exports.getAIRecommendations = async (req, res, next) => {
    if (!groq) {
        return baseResponse(res, false, 503, "Layanan Rekomendasi AI saat ini tidak tersedia (konfigurasi gagal).", null);
    }

    const { bio, disabilityDetails } = req.body;
    const user = req.user;

    if (!user) {
        return baseResponse(res, false, 401, "Pengguna tidak terautentikasi.", null);
    }

    let allCourses = [];
    let allCommunities = [];

    try {
        const coursesResult = await courseRepository.findAllCourses({}, { page: 1, limit: 1000 });
        allCourses = coursesResult.data.map(c => ({
            id: c.course_id,
            title: c.title,
            description: c.description.substring(0, 150) + (c.description.length > 150 ? "..." : ""),
            category: c.category,
            level: c.level
        }));

        const communitiesResult = await communityRepository.findAllCommunities({}, { page: 1, limit: 1000 });
        allCommunities = communitiesResult.data.map(c => ({
            id: c.community_id,
            name: c.name,
            description: c.description ? (c.description.substring(0, 150) + (c.description.length > 150 ? "..." : "")) : "Tidak ada deskripsi",
        }));
    } catch (dbError) {
        console.error("Error fetching courses/communities for AI prompt:", dbError);
        return next(new Error("Gagal mengambil data untuk rekomendasi."));
    }
    
    if (allCourses.length === 0 && allCommunities.length === 0) {
        return baseResponse(res, true, 200, "Tidak ada kursus atau komunitas tersedia untuk direkomendasikan saat ini.", {
            recommendedCourses: [],
            recommendedCommunities: []
        });
    }

    const userProfilePrompt = `Bio pengguna: "${bio || 'Tidak ada bio'}".\nDetail Disabilitas: "${disabilityDetails || 'Tidak ada detail disabilitas'}".`;
    
    let availableItemsPrompt = "";
    if (allCourses.length > 0) {
        availableItemsPrompt += `Daftar pelatihan yang tersedia (format: ID || Judul || Deskripsi Singkat || Kategori || Level):\n`;
        allCourses.forEach(c => {
            availableItemsPrompt += `${c.id} || ${c.title} || ${c.description} || ${c.category || 'N/A'} || ${c.level || 'N/A'}\n`;
        });
    }
     if (allCommunities.length > 0) {
        availableItemsPrompt += `\nDaftar komunitas yang tersedia (format: ID || Nama || Deskripsi Singkat):\n`;
        allCommunities.forEach(c => {
            availableItemsPrompt += `${c.id} || ${c.name} || ${c.description}\n`;
        });
    }

    const systemMessage = `Anda adalah asisten AI yang sangat ahli dalam memberikan rekomendasi pelatihan dan komunitas di platform "RakitCita" untuk pengguna penyandang disabilitas. Tujuan Anda adalah membantu pengguna menemukan sumber daya yang paling relevan dan bermanfaat berdasarkan profil mereka. Pertimbangkan minat, tujuan (jika tersirat dari bio), dan terutama kebutuhan atau preferensi yang mungkin terkait dengan detail disabilitas mereka.`;
    
    const userMessageForAI = `
     ${systemMessage}

     Profil Pengguna:
     ${userProfilePrompt}

     ${availableItemsPrompt}

     Tugas Anda:
     Berdasarkan profil pengguna dan daftar di atas, berikan rekomendasi hingga 3 pelatihan dan 3 komunitas yang paling cocok.
     Jelaskan secara singkat (1 kalimat per item) mengapa setiap item direkomendasikan untuk pengguna ini.
     
     Format respons Anda HARUS SEBAGAI objek JSON valid dengan struktur berikut, dan tidak ada teks lain di luar objek JSON ini:
     {
       "recommendedCourseIdsWithReason": [
         {"id": "id-kursus-1", "reason": "Alasan singkat mengapa kursus ini cocok."},
         {"id": "id-kursus-2", "reason": "Alasan singkat."}
       ],
       "recommendedCommunityIdsWithReason": [
         {"id": "id-komunitas-a", "reason": "Alasan singkat mengapa komunitas ini cocok."},
         {"id": "id-komunitas-b", "reason": "Alasan singkat."}
       ]
     }
     Jika tidak ada item yang sangat cocok, kembalikan array kosong untuk kunci yang relevan. Hanya sertakan ID yang ada dalam daftar yang diberikan.
     Pastikan ID yang dikembalikan adalah UUID yang valid dari daftar yang diberikan.
    `;

    try {
        console.log("Mengirim permintaan ke Groq API...");

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'user', content: userMessageForAI }
            ],
            // --- GANTI MODEL DI SINI ---
            model: 'llama3-8b-8192', // CONTOH: Ganti dengan model yang aktif dari dokumentasi Groq
            // Contoh lain yang mungkin: 'gemma-7b-it'
            // --- PASTIKAN MODEL INI AKTIF DI GROQ ---
            temperature: 0.3,
            max_tokens: 1024, // Sesuaikan jika perlu, Llama3 8B memiliki konteks 8192 token
        });

        console.log("Raw Groq AI response:", chatCompletion.choices[0]?.message?.content);

        let aiResponseJson;
        const responseContent = chatCompletion.choices[0]?.message?.content;
        if (!responseContent) {
            console.error("Groq AI response content is empty or undefined.");
            return next(new Error("Respons dari AI kosong."));
        }
        
        try {
            let cleanedContent = responseContent;
            const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
            if (jsonMatch) {
                cleanedContent = jsonMatch[1] || jsonMatch[2];
            } else {
                 console.warn("Tidak dapat menemukan blok JSON yang jelas (```json ... ``` atau {...}) dalam respons AI. Mencoba parse langsung.");
            }
            aiResponseJson = JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error("Error parsing Groq AI JSON response:", parseError);
            console.error("AI response content (original):", responseContent);
            return next(new Error("Gagal memproses respons dari AI. Format tidak valid."));
        }
        
        const { recommendedCourseIdsWithReason = [], recommendedCommunityIdsWithReason = [] } = aiResponseJson;

        let recommendedCoursesDetails = [];
        if (recommendedCourseIdsWithReason.length > 0) {
            const courseIds = recommendedCourseIdsWithReason.map(item => item.id).filter(id => typeof id === 'string');
            const validCourseIds = courseIds.filter(id => allCourses.some(c => c.id === id));
            
            recommendedCoursesDetails = await Promise.all(
                validCourseIds.map(async (id) => {
                    const courseDetail = await courseRepository.findCourseById(id);
                    const reasonItem = recommendedCourseIdsWithReason.find(item => item.id === id);
                    return courseDetail ? { ...courseDetail, recommendationReason: reasonItem?.reason } : null;
                })
            );
            recommendedCoursesDetails = recommendedCoursesDetails.filter(c => c !== null);
        }

        let recommendedCommunitiesDetails = [];
        if (recommendedCommunityIdsWithReason.length > 0) {
            const communityIds = recommendedCommunityIdsWithReason.map(item => item.id).filter(id => typeof id === 'string');
            const validCommunityIds = communityIds.filter(id => allCommunities.some(c => c.id === id));

            recommendedCommunitiesDetails = await Promise.all(
                validCommunityIds.map(async (id) => {
                    const communityDetail = await communityRepository.findCommunityById(id);
                    const reasonItem = recommendedCommunityIdsWithReason.find(item => item.id === id);
                    return communityDetail ? { ...communityDetail, recommendationReason: reasonItem?.reason } : null;
                })
            );
            recommendedCommunitiesDetails = recommendedCommunitiesDetails.filter(c => c !== null);
        }

        return baseResponse(res, true, 200, "Rekomendasi berhasil diambil.", {
            recommendedCourses: recommendedCoursesDetails,
            recommendedCommunities: recommendedCommunitiesDetails,
        });

    } catch (aiError) {
        if (aiError.status === 401) {
             console.error("Groq API Error (401 - Unauthorized): Invalid API Key.", aiError.message);
             return next(new Error("Kunci API Groq tidak valid atau tidak diotorisasi."));
        }
        // Tangani error model decommissioned secara spesifik jika perlu
        if (aiError.code === 'model_decommissioned' || (aiError.response && aiError.response.data && aiError.response.data.error && aiError.response.data.error.code === 'model_decommissioned')) {
            console.error("Groq API Error: Model yang diminta sudah tidak didukung.", aiError.message);
            return next(new Error("Model AI yang digunakan untuk rekomendasi sudah tidak didukung. Harap hubungi administrator."));
        }
        console.error("Groq API Error (Umum):", aiError.response ? aiError.response.data : aiError.message || aiError);
        return next(new Error("Gagal mendapatkan rekomendasi dari layanan AI."));
    }
};