import { cn } from "@/lib/utils"

export default function SVGTitle({svg, margin, title}) {
    return (
        <div className={cn(`flex flex-row justify-center items-center`, margin)}>
            {svg}
            <span className="poppins text-sm uppercase text-white px-4 py-3">{title}</span>
        </div>
    )
}