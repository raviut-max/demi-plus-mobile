import { Play, FileText, User, Dumbbell } from "lucide-react"
import { knowledgeArticles } from "@/lib/mock-data"
import { StarBackground } from "@/components/star-background"
import Image from "next/image"

export default function KnowledgePage() {
  return (
    <div className="relative">
      <StarBackground />
      <div className="relative z-10 px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">
            ความรู้สำหรับนักกีฬา
          </h1>
          <div className="h-14 w-14 overflow-hidden rounded-full bg-[#DBEAFE]">
            <div className="flex h-full w-full items-center justify-center">
              <Dumbbell className="h-6 w-6 text-[#3B82F6]" />
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="mt-4 flex flex-col gap-3 pb-6">
          {knowledgeArticles.map((article, idx) => (
            <div key={article.id} className="card-soft overflow-hidden">
              <div className="flex items-start gap-3 p-4">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-foreground">
                    {article.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {article.description}
                  </p>
                  {(article.hasVideo || article.hasArticle) && (
                    <div className="mt-3 flex gap-2">
                      {article.hasVideo && (
                        <button className="btn-green-gradient flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-[#FFFFFF]">
                          <Play className="h-3 w-3" fill="currentColor" />
                          ดูคลิป 3 นาที
                        </button>
                      )}
                      {article.hasArticle && (
                        <button className="flex items-center gap-1.5 rounded-full border border-[#22C55E] bg-card px-4 py-1.5 text-xs font-semibold text-[#22C55E]">
                          <FileText className="h-3 w-3" />
                          อ่านบทความ
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {/* Show mascot for certain articles */}
                {idx < 2 && (
                  <Image
                    src="/images/mascot-main.png"
                    alt="DeMi+ Mascot"
                    width={60}
                    height={70}
                    className="h-auto w-14 shrink-0"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
