import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate SSO authentication delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f4f5] relative overflow-hidden">
      {/* Blue vignette/glow effect around viewport edges */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 200px 80px rgba(59, 130, 246, 0.15), inset 0 0 100px 40px rgba(59, 130, 246, 0.1)'
        }}
      />
      
      {/* Login Card */}
      <Card className="w-full max-w-md mx-4 shadow-lg border-0 bg-white relative z-10">
        <CardHeader className="text-center pb-4 pt-8">
          {/* Logo Icon */}
          <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-[#2563eb] flex items-center justify-center">
            <User className="h-7 w-7 text-white" />
          </div>
          
          <CardTitle className="text-2xl font-bold text-[#09090b]">
            OOH Helpdesk
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-2">
            Sign in with your Azure AD account to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-8 px-8">
          {/* Sign in with Azure AD Button */}
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded-md shadow-sm transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg 
                  className="h-5 w-5" 
                  viewBox="0 0 21 21" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                </svg>
                <span>Sign in with Azure AD</span>
              </div>
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground mt-4">
            You will be redirected to Microsoft Azure AD for secure authentication
          </p>
        </CardContent>
      </Card>
      
      {/* Footer */}
      <div className="absolute bottom-6 text-center text-xs text-muted-foreground">
        Protected by Azure Active Directory
      </div>
    </div>
  );
}
