import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, LayoutGrid, SlidersHorizontal } from 'lucide-react'
import { IdeaCard, type IdeaItem } from './IdeaCard'

interface IdeaCarouselProps {
  ideas: IdeaItem[]
  onCopy?: (idea: IdeaItem, rank: number) => void
}

export const IdeaCarousel: React.FC<IdeaCarouselProps> = ({ ideas, onCopy }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false)
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel')

  // Pagination for Grid mode
  const [pageSize, setPageSize] = useState<number>(3)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const totalPages = Math.ceil((ideas?.length || 0) / pageSize)
  const paginatedIdeas = ideas.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  // Reset pagination when ideas change
  useEffect(() => {
    setCurrentPage(1)
  }, [ideas.length, pageSize])

  if (!ideas || ideas.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Controls Bar: View Toggle + Slide Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[#6E6E73]">View:</span>
          <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-[#F5F5F7]">
            <button
              type="button"
              onClick={() => setViewMode('carousel')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                viewMode === 'carousel'
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Carousel</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Paginated Grid</span>
            </button>
          </div>
        </div>

        {viewMode === 'carousel' ? (
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#007AFF] font-bold">
              Idea {selectedIndex + 1} of {ideas.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={scrollPrev}
                disabled={prevBtnDisabled}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-[#F5F5F7] text-[#1D1D1F] hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Previous idea"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                disabled={nextBtnDisabled}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-[#F5F5F7] text-[#1D1D1F] hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Next idea"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Grid Pagination Settings */
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#6E6E73]">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-[#F5F5F7] border border-slate-200 rounded-lg px-2 py-1 text-[#1D1D1F] text-xs font-medium focus:outline-hidden"
              >
                <option value={3}>3 / page</option>
                <option value={5}>5 / page</option>
                <option value={10}>All 10</option>
              </select>
            </div>

            <span className="font-mono text-xs text-[#007AFF] font-bold">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </div>

      {/* Mode A: Embla Carousel View */}
      {viewMode === 'carousel' ? (
        <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
          <div className="flex gap-4">
            {ideas.map((idea, index) => (
              <div key={index} className="flex-[0_0_100%] sm:flex-[0_0_92%] md:flex-[0_0_88%] min-w-0">
                <IdeaCard idea={idea} rank={index + 1} index={index} onCopy={onCopy} />
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 pt-4">
            {scrollSnaps.map((_, dotIndex) => (
              <button
                key={dotIndex}
                onClick={() => scrollTo(dotIndex)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  dotIndex === selectedIndex ? 'w-6 bg-[#007AFF]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${dotIndex + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Mode B: Paginated Grid View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-5">
            {paginatedIdeas.map((idea, idx) => {
              const actualRank = (currentPage - 1) * pageSize + idx + 1
              return (
                <IdeaCard
                  key={actualRank}
                  idea={idea}
                  rank={actualRank}
                  index={idx}
                  onCopy={onCopy}
                />
              )
            })}
          </div>

          {/* Pagination Navigation Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono text-[#1D1D1F] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous Page</span>
              </button>

              <div className="flex items-center gap-1 font-mono text-xs">
                {Array.from({ length: totalPages }).map((_, pIdx) => {
                  const pNum = pIdx + 1
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-7 h-7 rounded-md font-bold transition-all cursor-pointer ${
                        currentPage === pNum
                          ? 'bg-[#007AFF] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-[#1D1D1F] hover:bg-[#F5F5F7]'
                      }`}
                    >
                      {pNum}
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono text-[#1D1D1F] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <span>Next Page</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
