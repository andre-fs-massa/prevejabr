import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Copy, Check, Users, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralStats {
  totalReferrals: number;
  totalEarnings: number;
}

const ReferralShare = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats>({ totalReferrals: 0, totalEarnings: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;

    setLoading(true);

    // Fetch referral code
    const { data: codeData } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", user.id)
      .maybeSingle();

    if (codeData) {
      setReferralCode(codeData.code);
    }

    // Fetch referral stats
    const { data: referralsData } = await supabase
      .from("referrals")
      .select("bonus_amount")
      .eq("referrer_id", user.id);

    if (referralsData) {
      const totalReferrals = referralsData.length;
      const totalEarnings = referralsData.reduce(
        (sum, r) => sum + Number(r.bonus_amount),
        0
      );
      setStats({ totalReferrals, totalEarnings });
    }

    setLoading(false);
  };

  const getReferralLink = () => {
    if (!referralCode) return "";
    return `${window.location.origin}/auth?ref=${referralCode}`;
  };

  const handleCopy = async () => {
    const link = getReferralLink();
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link copiado!",
      description: "Compartilhe com seus amigos.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const link = getReferralLink();
    const message = `🎯 Venha apostar em previsões comigo no Preveja.br! Use meu código e ganhe R$ 25 de bônus!\n\n${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Indique e Ganhe R$ 25
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">{stats.totalReferrals}</p>
            <p className="text-xs text-muted-foreground">Indicados</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Gift className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-500">
              R$ {stats.totalEarnings.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Ganhos</p>
          </div>
        </div>

        {/* Referral Code */}
        {referralCode && (
          <div className="p-3 rounded-lg border border-dashed border-primary/50 bg-primary/5 text-center">
            <p className="text-xs text-muted-foreground mb-1">Seu código</p>
            <p className="text-lg font-mono font-bold text-primary tracking-widest">
              {referralCode}
            </p>
          </div>
        )}

        {/* Share Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleWhatsAppShare}
            className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="px-4"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Cada amigo que se cadastrar pelo seu link te dá R$ 25!
        </p>
      </CardContent>
    </Card>
  );
};

export default ReferralShare;
