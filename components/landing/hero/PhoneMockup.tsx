"use client";

import MockRestaurantScreen from "./MockRestaurantScreen";

export default function PhoneMockup() {
    return (
        <div className="relative flex w-full items-center justify-center lg:justify-end">

            {/* Background Glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[90%] w-[90%] rounded-full bg-gradient-to-br from-orange-400/30 via-orange-300/20 to-transparent blur-[150px]" />
            </div>

            {/* Phone */}
            <div
                className="
                    relative
                    w-full
                    max-w-[390px]
                    aspect-[702/1600]
                    animate-[float_6s_ease-in-out_infinite]
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:scale-[1.02]
                "
            >
                {/* Shadow */}
                <div className="absolute inset-x-10 bottom-2 h-24 rounded-full bg-black/20 blur-3xl" />

                {/* Outer Frame */}
                <div className="absolute inset-0 rounded-[58px] bg-neutral-900 p-[8px] shadow-[0_45px_90px_rgba(0,0,0,.28)]">

                    {/* Metallic Border */}
                    <div className="relative h-full w-full rounded-[50px] bg-gradient-to-b from-neutral-700 to-neutral-900 p-[2px]">

                        {/* Screen */}
                        <div className="relative h-full w-full overflow-hidden rounded-[48px] bg-white">

                            {/* Dynamic Island */}
                            <div className="absolute left-1/2 top-3 z-30 h-7 w-36 -translate-x-1/2 rounded-full bg-black shadow-inner" />

                            {/* Glass Reflection */}
                            <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-10 bg-gradient-to-r from-white/15 via-white/5 to-transparent" />

                            {/* Screen Content */}
                            <MockRestaurantScreen />

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}