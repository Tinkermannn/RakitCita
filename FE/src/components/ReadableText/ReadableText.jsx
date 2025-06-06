// src/components/ReadableText/ReadableText.jsx
import React, { useRef, useEffect, useCallback } from 'react';

const ReadableText = ({
    children,
    tag = 'p',
    textToRead, // Teks spesifik yang ingin dibaca, jika berbeda dari children
    className,
    speakOnHover = true,   // Default: baca saat hover/fokus
    speakOnMount = false,  // Baca saat komponen pertama kali dimuat
    stopOnLeave = true,    // Hentikan suara saat mouse leave / blur
    lang = 'id-ID',        // Bahasa default
    rate = 1,              // Kecepatan bicara (0.1 - 10)
    pitch = 1,             // Nada (0 - 2)
    volume = 1,            // Volume (0 - 1)
    ...props
}) => {
    const utteranceRef = useRef(null);
    const elementRef = useRef(null);
    const isMountedRef = useRef(false);
    const voicesLoadedRef = useRef(false); // Untuk menandai apakah voices sudah dimuat

    // Fungsi untuk memuat voices jika belum
    const ensureVoicesLoaded = useCallback(() => {
        if (!window.speechSynthesis) return;
        if (window.speechSynthesis.getVoices().length > 0) {
            voicesLoadedRef.current = true;
            return;
        }
        window.speechSynthesis.onvoiceschanged = () => {
            voicesLoadedRef.current = true;
            console.log("SpeechSynthesis voices loaded.");
        };
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        ensureVoicesLoaded(); // Panggil saat mount

        return () => {
            isMountedRef.current = false;
            if (window.speechSynthesis && window.speechSynthesis.speaking && utteranceRef.current) {
                window.speechSynthesis.cancel(); // Hentikan semua ucapan terkait komponen ini saat unmount
            }
        };
    }, [ensureVoicesLoaded]);


    const speakText = useCallback((text) => {
        if (!text || typeof text !== 'string' || !window.speechSynthesis) return;

        // Fungsi ini akan dieksekusi setelah voices dimuat atau jika sudah dimuat
        const doSpeak = () => {
            if (!isMountedRef.current) return; // Jangan speak jika komponen sudah unmount

            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }

            const newUtterance = new SpeechSynthesisUtterance(text);
            newUtterance.lang = lang;
            newUtterance.rate = rate;
            newUtterance.pitch = pitch;
            newUtterance.volume = volume;

            const voices = window.speechSynthesis.getVoices();
            const selectedVoice = voices.find(voice => voice.lang === lang);
            if (selectedVoice) {
                newUtterance.voice = selectedVoice;
            } else {
                console.warn(`Suara untuk bahasa "${lang}" tidak ditemukan, menggunakan suara default.`);
            }

            // Atasi error "SpeechSynthesisUtterance is not allowed to start" di beberapa browser
            // dengan sedikit jeda atau interaksi pengguna sebelumnya.
            // Untuk hover, ini mungkin kurang menjadi masalah dibandingkan speakOnMount.
            newUtterance.onend = () => {
                utteranceRef.current = null;
            };
            newUtterance.onerror = (event) => {
                console.error("SpeechSynthesisUtterance Error:", event.error);
                utteranceRef.current = null;
            };

            utteranceRef.current = newUtterance;
            window.speechSynthesis.speak(newUtterance);
        };

        if (voicesLoadedRef.current) {
            doSpeak();
        } else {
            // Jika voices belum dimuat, tunggu event onvoiceschanged (sudah di-setup di useEffect)
            // atau coba lagi setelah jeda singkat sebagai fallback (meskipun onvoiceschanged lebih baik)
            const waitAndSpeak = () => {
                if (voicesLoadedRef.current) {
                    doSpeak();
                } else if (isMountedRef.current) {
                    // Coba lagi jika voices masih belum juga termuat setelah event
                    console.warn("Voices still not loaded, retrying speakText in 100ms");
                    setTimeout(waitAndSpeak, 100);
                }
            };
            // Jika onvoiceschanged belum terpanggil, set timeout
            if(window.speechSynthesis.getVoices().length === 0){
                setTimeout(waitAndSpeak, 50); // Jeda singkat
            } else { // Jika sudah ada tapi ref belum true (jarang terjadi)
                voicesLoadedRef.current = true;
                doSpeak();
            }
        }

    }, [lang, rate, pitch, volume]); // Dependensi untuk speakText

    const stopSpeaking = useCallback(() => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        utteranceRef.current = null;
    }, []);

    const getTextFromChildren = (node) => {
        if (!node) return '';
        if (typeof node === 'string') return node;
        if (Array.isArray(node)) return node.map(getTextFromChildren).join(' ');
        if (typeof node.props?.children !== 'undefined') {
            return getTextFromChildren(node.props.children);
        }
        return '';
    };

    const handleMouseEnterOrFocus = useCallback((event) => {
        if (!speakOnHover) return;
        const textContent = textToRead || getTextFromChildren(children) || event.currentTarget.textContent || event.currentTarget.innerText;
        speakText(textContent.trim());
    }, [speakOnHover, textToRead, children, speakText]);

    const handleMouseLeaveOrBlur = useCallback(() => {
        if (stopOnLeave) {
            stopSpeaking();
        }
    }, [stopOnLeave, stopSpeaking]);

    // Untuk speakOnMount
    useEffect(() => {
        if (speakOnMount && elementRef.current && isMountedRef.current) {
            const textContent = textToRead || getTextFromChildren(children) || elementRef.current.textContent || elementRef.current.innerText;
            if (textContent) {
                 // Memberi jeda agar voice list (jika async) sempat termuat
                const attemptSpeakOnMount = (retries = 5) => {
                    if (!isMountedRef.current) return;
                    if (voicesLoadedRef.current || window.speechSynthesis.getVoices().length > 0) {
                        speakText(textContent.trim());
                    } else if (retries > 0) {
                        console.log(`speakOnMount: voices not ready, retrying... (${retries})`);
                        setTimeout(() => attemptSpeakOnMount(retries - 1), 200);
                    } else {
                        console.warn("speakOnMount: Failed to load voices in time.");
                    }
                };
                attemptSpeakOnMount();
            }
        }
    }, [speakOnMount, textToRead, children, speakText]); // Jalankan ketika prop ini berubah


    const Tag = tag;

    return (
        <Tag
            ref={elementRef}
            onMouseEnter={handleMouseEnterOrFocus}
            onMouseLeave={handleMouseLeaveOrBlur}
            onFocus={handleMouseEnterOrFocus} // Baca saat fokus dengan keyboard
            onBlur={handleMouseLeaveOrBlur}  // Hentikan saat blur
            className={className}
            aria-live="polite" // Bisa membantu screen reader jika konten teks dinamis
            tabIndex={props.onClick || Tag === 'button' || Tag === 'a' || Tag === 'input' ? undefined : 0} // Buat focusable jika bukan elemen interaktif alami
            {...props}
        >
            {children}
        </Tag>
    );
};

export default ReadableText;