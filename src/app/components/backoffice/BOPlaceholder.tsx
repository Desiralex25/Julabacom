import React from 'react';
import { motion } from 'motion/react';
import { Construction } from 'lucide-react';

const BO_PRIMARY = '#E6A817';

interface BOPlaceholderProps {
  title: string;
  description: string;
  bloc?: number;
}

export function BOPlaceholder({ title, description, bloc = 2 }: BOPlaceholderProps) {
  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-12 shadow-md border-2 border-gray-100 text-center"
      >
        <motion.div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ backgroundColor: `${BO_PRIMARY}20` }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Construction className="w-10 h-10" style={{ color: BO_PRIMARY }} />
        </motion.div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 mb-4">{description}</p>
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 font-bold text-sm"
          style={{ borderColor: BO_PRIMARY, color: BO_PRIMARY }}>
          Disponible dans le Bloc {bloc}
        </div>
      </motion.div>
    </div>
  );
}
