import { motion } from 'framer-motion';

const DNALoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <motion.div
        className="relative w-32 h-32"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          className="absolute inset-0 border-4 border-primary rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-2 border-4 border-secondary rounded-full"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-4 border-4 border-accent rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
      </motion.div>
    </div>
  );
};

export default DNALoader;
