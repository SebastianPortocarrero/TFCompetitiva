import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import logo from '../img/logo.webp';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(email, password);

    if (success) {
      toast.success('Inicio de sesión exitoso');
      navigate('/dashboard');
    } else {
      toast.error('Credenciales incorrectas');
    }

    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed p-4"
      style={{ backgroundImage: "url('/src/img/fondoADN.webp')" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 shadow-glow">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
              <img src={logo} alt="DNA Forensics Logo" className="w-16 h-16 object-contain filter brightness-125 contrast-125 drop-shadow-lg" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">DNA Forensics</h1>
            <p className="text-sm text-muted-foreground mt-2">Sistema de Identificación PNP</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@pnp.gob.pe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>

            <Button
              type="submit"
              className="w-full btn-glow bg-gradient-primary hover:opacity-90"
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Credenciales de prueba:</p>
            <div className="space-y-1 text-xs">
              <p><strong>Admin:</strong> admin@pnp.gob.pe / 123456</p>
              <p><strong>Perito:</strong> perito@pnp.gob.pe / 123456</p>
              <p><strong>Investigador:</strong> investigador@pnp.gob.pe / 123456</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
