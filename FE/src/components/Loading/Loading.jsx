import React from "react";
import { motion } from "framer-motion";

export default function Loading({ size = 20, color = "#3b82f6" }) {
    return (
        <div className="flex justify-center items-center h-screen bg-white">
            <motion.div
                className="flex space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color, width: size, height: size }}
                        animate={{
                            y: [0, -20, 0],
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2,
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
}
