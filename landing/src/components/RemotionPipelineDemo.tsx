import { useState, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { PipelineComposition, PIPELINE_DURATION_FRAMES, PIPELINE_FPS } from "./remotion/PipelineComposition";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, MonitorPlay, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

export function RemotionPipelineDemo() {
  const { t, lang } = useLanguage();
  const playerRef = useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  const restart = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0);
    playerRef.current.play();
    setIsPlaying(true);
  };

  const jumpToStep = (stepIndex: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(stepIndex * 60);
  };

  return (
    <section id="pipeline-demo" className="py-20 px-6 relative overflow-hidden">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8ff5c]/10 border border-[#e8ff5c]/30 text-[#e8ff5c] text-xs font-mono font-semibold"
          >
            <MonitorPlay className="w-3.5 h-3.5" />
            <span>{t.pipelineDemo.badge}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-white"
          >
            {t.pipelineDemo.heading}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-2xl mx-auto text-base"
          >
            {t.pipelineDemo.sub}
          </motion.p>
        </div>

        {/* Player Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-white/15 bg-card/60 backdrop-blur-xl p-3 sm:p-5 shadow-2xl space-y-4"
        >
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlay}
                className="h-9 px-3 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#e8ff5c]" /> : <Play className="w-3.5 h-3.5 text-[#e8ff5c]" />}
                <span>{isPlaying ? t.pipelineDemo.pause : t.pipelineDemo.play}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={restart}
                className="h-9 px-3 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.pipelineDemo.restart}</span>
              </Button>
            </div>

            {/* Quick Step Jump Tabs */}
            <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
              {t.pipelineDemo.steps.map((item) => (
                <button
                  key={item.step}
                  onClick={() => jumpToStep(item.step)}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Embedded Remotion Player */}
          <div className="rounded-2xl overflow-hidden border border-white/10 aspect-[16/9] w-full bg-black shadow-inner">
            <Player
              ref={playerRef}
              component={PipelineComposition}
              inputProps={{ lang }}
              durationInFrames={PIPELINE_DURATION_FRAMES}
              compositionWidth={1280}
              compositionHeight={720}
              fps={PIPELINE_FPS}
              style={{
                width: "100%",
                height: "100%",
              }}
              controls={false}
              autoPlay
              loop
            />
          </div>

          {/* Caption / Badge */}
          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-white/40 px-2 pt-1">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#e8ff5c]" />
              <span>{t.pipelineDemo.caption}</span>
            </div>
            <span>{t.pipelineDemo.attribution}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
