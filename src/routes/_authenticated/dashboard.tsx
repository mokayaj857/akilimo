import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, CloudRain, Droplets, Leaf, ShieldAlert, Sprout, Store, Wallet } from "lucide-react";
import { FarmPage, MetricCard, SectionTitle } from "@/components/agritwin/Page";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Farm overview — AgriTwin" }, { name: "description", content: "Monitor crop health, weather, markets, and farm finance from your AgriTwin overview." }, { property: "og:title", content: "Farm overview — AgriTwin" }, { property: "og:description", content: "Your farm intelligence overview." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const name = (user?.user_metadata?.full_name || "Farmer").split(" ")[0];
  return <FarmPage eyebrow="Kijani Farm · Kiambu" title={`Good morning, ${name}`} description="Your maize is in the vegetative stage. AgriTwin is watching crop stress, weather, and market movement across your farm." action={<Button asChild className="h-10 rounded-xl"><Link to="/digital-twin">Open digital twin <ArrowRight /></Link></Button>}>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard icon={Leaf} label="Crop health" value="82 / 100" detail="NDVI is stable this week" /><MetricCard icon={ShieldAlert} label="Disease risk" value="Moderate" detail="Maize leaf blight conditions" tone="risk" /><MetricCard icon={CloudRain} label="Rain forecast" value="18 mm" detail="Expected in the next 3 days" tone="sky" /><MetricCard icon={Droplets} label="Soil moisture" value="61%" detail="Good across the east plot" tone="earth" /></div>
    <div className="mt-7 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5"><div><p className="text-xs font-medium text-primary">DIGITAL TWIN</p><h2 className="mt-1 text-lg font-semibold">Kijani Farm</h2></div><span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">Live</span></div>
        <div className="relative aspect-[16/8] overflow-hidden bg-[radial-gradient(circle_at_30%_40%,color-mix(in_oklab,var(--primary)_32%,transparent),transparent_28%),linear-gradient(135deg,color-mix(in_oklab,var(--earth)_22%,var(--background)),var(--background))]">
          <div className="absolute left-[12%] top-[18%] h-[58%] w-[45%] rotate-[-5deg] rounded-[35%_12%_28%_15%] border-2 border-primary bg-primary/20" /><div className="absolute right-[15%] top-[30%] h-[42%] w-[26%] rotate-6 rounded-[18%_38%_12%_30%] border border-earth bg-earth/20" /><div className="absolute left-[47%] top-[46%] size-4 rounded-full bg-sky ring-4 ring-sky/20" />
          <div className="absolute bottom-4 left-4 rounded-xl border border-border bg-popover/85 px-3 py-2 text-xs backdrop-blur"><span className="text-muted-foreground">Mapped area</span><strong className="ml-2">3.8 acres</strong></div>
        </div>
      </motion.section>
      <div className="space-y-5"><section className="rounded-2xl border border-risk/30 bg-risk/10 p-5"><div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 size-5 text-risk" /><div><p className="text-xs font-semibold uppercase text-risk">Early warning</p><h2 className="mt-1 font-semibold">Leaf blight risk is rising</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Humidity and rainfall patterns may favour disease development in the north maize zone.</p><Button asChild variant="outline" className="mt-4 h-9 rounded-xl"><Link to="/crop-health">Review risk</Link></Button></div></div></section>
      <section className="rounded-2xl border border-border bg-card p-5"><SectionTitle title="Today’s opportunities" /><Opportunity icon={Store} title="Sell maize in Nairobi" detail="KSh 4,650 / 90 kg · 8% above Thika" /><Opportunity icon={Wallet} title="SACCO match ready" detail="Up to KSh 120,000 based on farm profile" /></section></div>
    </div>
  </FarmPage>;
}

function Opportunity({ icon: Icon, title, detail }: { icon: typeof Store; title: string; detail: string }) { return <div className="flex gap-3 border-t border-border py-4 first:border-0 first:pt-0 last:pb-0"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-primary"><Icon className="size-4" /></span><div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div></div>; }