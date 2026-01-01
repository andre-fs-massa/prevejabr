import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { MessageCircle, Copy, Check, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MarketReferralShareProps {
  marketId: string;
  marketTitle: string;
}

const MarketReferralShare = ({ marketId, marketTitle }: MarketReferralShareProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReferralCode();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchReferralCode = async () => {
    if (!user) return;

    const { data: codeData } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", user.id)
      .maybeSingle();

    if (codeData) {
      setReferralCode(codeData.code);
    }
    setLoading(false);
  };

  const getMarketLink = () => {
    const baseUrl = `${window.location.origin}/markets/${marketId}`;
    if (referralCode) {
      return `${baseUrl}?ref=${referralCode}`;
    }
    return baseUrl;
  };

  const handleCopy = async () => {
    const link = getMarketLink();
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link copiado!",
      description: referralCode 
        ? "Compartilhe e ganhe 25 pontos por cada novo usuário!" 
        : "Compartilhe este mercado com seus amigos.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const link = getMarketLink();
    const message = referralCode
      ? `🎯 O que você acha? "${marketTitle}"\n\nAposte comigo no Preveja.br! Use meu código e ganhe 25 pontos de bônus!\n\n${link}`
      : `🎯 O que você acha? "${marketTitle}"\n\nVeja no Preveja.br:\n\n${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleTwitterShare = () => {
    const link = getMarketLink();
    const message = `🎯 ${marketTitle}\n\nFaça sua previsão no @PrevejaBr!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(link)}`;
    window.open(twitterUrl, "_blank");
  };

  if (loading) {
    return (
      <Button variant="secondary" size="lg" disabled className="gap-2 px-6 py-3 text-base font-semibold shadow-md">
        <Share2 className="h-5 w-5" />
        <span>Compartilhar</span>
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="secondary" 
          size="lg" 
          className="gap-2 px-6 py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0"
        >
          <Share2 className="h-5 w-5" />
          <span>Compartilhar</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Compartilhar mercado</h4>
            {user && referralCode ? (
              <p className="text-xs text-muted-foreground">
                Ganhe 25 pontos por cada novo usuário que se cadastrar!
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {user ? "Carregando código..." : "Faça login para ganhar bônus por indicação!"}
              </p>
            )}
          </div>

          {/* Share Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleWhatsAppShare}
              className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white"
              size="sm"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Compartilhar no WhatsApp
            </Button>
            
            <Button
              onClick={handleTwitterShare}
              className="w-full bg-black hover:bg-gray-800 text-white"
              size="sm"
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Compartilhar no X
            </Button>

            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar link
                </>
              )}
            </Button>
          </div>

          {user && referralCode && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                Seu código: <span className="font-mono font-bold text-primary">{referralCode}</span>
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MarketReferralShare;
