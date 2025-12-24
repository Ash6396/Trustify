import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Clock } from 'lucide-react'
import { normalizeImageUrl } from '../lib/image'

type Campaign = {
  _id: string
  title: string
  description: string
  goalAmountEth: number
  approved: boolean
  rejected?: boolean
  imageUrl?: string
  creator?: { name: string; email: string; role: string }
  createdAt?: string
}

type CampaignCardProps = {
  campaign: Campaign
  className?: string
  style?: React.CSSProperties
}

export default function CampaignCard({ campaign, className, style }: CampaignCardProps) {
  const imageSrc = normalizeImageUrl(campaign.imageUrl)
  return (
    <Link
      to={`/campaigns/${campaign._id}`}
      className={`group flex flex-col tf-card h-full min-h-[400px] overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 ${className || ''}`}
      style={style}
    >
      <div className="h-48 relative overflow-hidden bg-accent/20">
        {/* Placeholder Gradient if no image */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-violet-500/10" />

        {imageSrc ? (
          <img
            src={imageSrc}
            alt={campaign.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(e) => {
              ; (e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : null}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {campaign.approved ? (
            <div className="px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-xs font-semibold text-primary shadow-sm flex items-center gap-1">
              <Shield size={12} className="fill-current" />
              Verified
            </div>
          ) : campaign.rejected ? (
            <div className="px-2.5 py-1 rounded-full bg-red-100/90 dark:bg-red-900/30 backdrop-blur text-xs font-semibold text-red-700 dark:text-red-300 shadow-sm flex items-center gap-1">
              <Clock size={12} />
              Rejected
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-full bg-amber-100/90 dark:bg-amber-900/90 backdrop-blur text-xs font-semibold text-amber-700 dark:text-amber-300 shadow-sm flex items-center gap-1">
              <Clock size={12} />
              Pending
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <h3 className="font-heading text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {campaign.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-6 line-clamp-3 leading-relaxed flex-1">
          {campaign.description}
        </p>

        {/* Progress bar placeholder (since we don't have raised amount passed in usually, maybe optional) */}
        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold">
                {campaign.creator?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {campaign.creator?.name || 'Unknown'}
            </span>
            <span>Goal: {campaign.goalAmountEth} ETH</span>
          </div>

          <div className="pt-4 border-t border-border/50 flex items-center justify-between text-sm font-medium text-primary">
            <span>View Campaign</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}
