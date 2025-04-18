import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, isLoading } = useAuth();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    await signUp(email, password, name);
  };

  return (
    <div className="grid h-screen place-items-center bg-gray-100">
      <Card className="w-96">
        <CardHeader className="space-y-1">
          <h4 className="text-center text-2xl font-semibold">
            {isSignUp ? "Criar Conta" : "Entrar"}
          </h4>
          <p className="text-center text-sm text-muted-foreground">
            {isSignUp
              ? "Crie uma nova conta para acessar o sistema"
              : "Entre com seu email e senha"}
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          {isSignUp && (
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">Mostrar senha</span>
              </Button>
            </div>
          </div>
          {isSignUp && (
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={confirmPasswordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {confirmPasswordVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">Mostrar senha</span>
                </Button>
              </div>
            </div>
          )}
          <Button
            disabled={isLoading}
            onClick={isSignUp ? handleSignUp : handleSignIn}
          >
            {isLoading
              ? "Carregando..."
              : isSignUp
              ? "Criar Conta"
              : "Entrar"}
          </Button>
        </CardContent>
        <div className="p-4 text-center text-sm">
          {isSignUp ? (
            <>
              Já tem uma conta?{" "}
              <Button variant="link" onClick={() => setIsSignUp(false)}>
                Entrar
              </Button>
            </>
          ) : (
            <>
              Não tem uma conta?{" "}
              <Button variant="link" onClick={() => setIsSignUp(true)}>
                Criar Conta
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Auth;
