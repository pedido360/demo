"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { AnchorHTMLAttributes, MouseEventHandler } from "react";
import { recordGuideMetric, type GuideMetricEvent } from "@/lib/repositories/guide-metrics.repository";

type ProposalClickEvent = Exclude<
    GuideMetricEvent,
    "guide_view" | "restaurant_view" | "proposal_view"
>;

export default function ProposalMetricTracker() {
    useEffect(() => {
        void recordGuideMetric("proposal_view");
    }, []);

    return null;
}

type TrackedProposalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    eventType: ProposalClickEvent;
    href: string;
};

export function TrackedProposalLink({
    eventType,
    onClick,
    ...props
}: TrackedProposalLinkProps) {
    const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
            void recordGuideMetric(eventType);
        }
    };

    return <a {...props} onClick={handleClick} />;
}

export function TrackedProposalInternalLink({
    eventType,
    onClick,
    ...props
}: TrackedProposalLinkProps) {
    const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
            void recordGuideMetric(eventType);
        }
    };

    return <Link {...props} onClick={handleClick} />;
}
