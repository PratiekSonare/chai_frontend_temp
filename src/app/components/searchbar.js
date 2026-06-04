import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
gsap.registerPlugin(ScrollTrigger);

export default function Searchbar({
  searchbarRef,
  placeholder,
  inputValue,
  setInputValue,
  onSearch,
  isError,
  isLoading,
  isSuccess,
}) {
  const [searchHistory, setSearchHistory] = useState(() => {
    if (typeof window === 'undefined') return [];
    const storedHistory = localStorage.getItem("searchHistory");
    if (storedHistory) {
      try {
        return JSON.parse(storedHistory);
      } catch (e) {
        console.error("Failed to parse search history:", e);
      }
    }
    return [];
  });
  const queryDetailsRef = useRef(null);

  // Handle search with history tracking
  const handleSearch = (query) => {
    if (query.trim()) {
      // Add to history (remove duplicates, keep last 5)
      const newHistory = [
        query,
        ...searchHistory.filter((item) => item !== query),
      ].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      onSearch(query);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(inputValue);
    }
  };

  useEffect(() => {
    if (!isSuccess || !queryDetailsRef.current) {
      return;
    }

    const node = queryDetailsRef.current;

    gsap.from(node, {
      y: 125,
      opacity: 0,
      duration: 1,
      ease: "bounce",
    });

    // Start from roughly Tailwind -translate-y-15 (3.75rem ~= 60px), then ease to 0 on scroll.
    gsap.set(node, { y: -60 });

    const scrollTween = gsap.to(node, {
      y: 0,
      ease: "none",
      scrollTrigger: {
        trigger: node,
        start: "top 85%",
        end: "top 55%",
        scrub: 1,
      },
    });

    return () => {
      scrollTween.scrollTrigger?.kill();
      scrollTween.kill();
    };
  }, [isSuccess]);

  return (
    <div
      ref={searchbarRef}
      className={`${isLoading ? "opacity-50" : "opacity-100"} group transition-opacity duration-100 ease-in flex flex-row gap-2 items-center`}
      style={{ width: "75%" }}
    >
      {/* history dropdown button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="scale-100 active:scale-95 duration-100 ease-in poppins border rounded-xl h-full flex flex-1/18 items-center justify-center bg-transparent disabled:opacity-50"
            disabled={searchHistory.length === 0}
            title="View search history"
          >
            <svg
              className="w-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M12 8V12L14.5 14.5"
                  stroke="#0019B1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>{" "}
                <path
                  d="M5.60414 5.60414L5.07381 5.07381V5.07381L5.60414 5.60414ZM4.33776 6.87052L3.58777 6.87429C3.58984 7.28556 3.92272 7.61844 4.33399 7.62051L4.33776 6.87052ZM6.87954 7.6333C7.29375 7.63539 7.63122 7.30129 7.6333 6.88708C7.63538 6.47287 7.30129 6.1354 6.88708 6.13332L6.87954 7.6333ZM5.07496 4.3212C5.07288 3.90699 4.73541 3.5729 4.3212 3.57498C3.90699 3.57706 3.5729 3.91453 3.57498 4.32874L5.07496 4.3212ZM3.82661 10.7849C3.88286 10.3745 3.59578 9.99627 3.1854 9.94002C2.77503 9.88377 2.39675 10.1708 2.3405 10.5812L3.82661 10.7849ZM18.8622 5.13777C15.042 1.31758 8.86873 1.27889 5.07381 5.07381L6.13447 6.13447C9.33358 2.93536 14.5571 2.95395 17.8016 6.19843L18.8622 5.13777ZM5.13777 18.8622C8.95796 22.6824 15.1313 22.7211 18.9262 18.9262L17.8655 17.8655C14.6664 21.0646 9.44291 21.0461 6.19843 17.8016L5.13777 18.8622ZM18.9262 18.9262C22.7211 15.1313 22.6824 8.95796 18.8622 5.13777L17.8016 6.19843C21.0461 9.44291 21.0646 14.6664 17.8655 17.8655L18.9262 18.9262ZM5.07381 5.07381L3.80743 6.34019L4.86809 7.40085L6.13447 6.13447L5.07381 5.07381ZM4.33399 7.62051L6.87954 7.6333L6.88708 6.13332L4.34153 6.12053L4.33399 7.62051ZM5.08775 6.86675L5.07496 4.3212L3.57498 4.32874L3.58777 6.87429L5.08775 6.86675ZM2.3405 10.5812C1.93907 13.5099 2.87392 16.5984 5.13777 18.8622L6.19843 17.8016C4.27785 15.881 3.48663 13.2652 3.82661 10.7849L2.3405 10.5812Z"
                  fill="#0019B1"
                ></path>{" "}
              </g>
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Recent Searches</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {searchHistory.length > 0 ? (
            <>
              {searchHistory.map((query, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => {
                    setInputValue(query);
                    handleSearch(query);
                  }}
                  className="cursor-pointer"
                >
                  {query}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSearchHistory([]);
                  localStorage.removeItem("searchHistory");
                }}
                className="cursor-pointer text-red-600"
              >
                Clear History
              </DropdownMenuItem>
            </>
          ) : (
            <div className="px-2 py-1.5 text-sm text-gray-500">
              No search history yet
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="relative searchCard example-2 w-full">
        <div className="inner border border-blue-300 h-20">
          <div className="p-2 flex flex-row gap-5 items-center justify-center h-full">
            <div className="w-full flex flex-row gap-0 items-center justify-start">
              <svg
                className="w-8 ml-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 5C7.23858 5 5 7.23858 5 10C5 12.7614 7.23858 15 10 15C11.381 15 12.6296 14.4415 13.5355 13.5355C14.4415 12.6296 15 11.381 15 10C15 7.23858 12.7614 5 10 5ZM3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 11.5719 16.481 13.0239 15.6063 14.1921L20.7071 19.2929C21.0976 19.6834 21.0976 20.3166 20.7071 20.7071C20.3166 21.0976 19.6834 21.0976 19.2929 20.7071L14.1921 15.6063C13.0239 16.481 11.5719 17 10 17C6.13401 17 3 13.866 3 10Z"
                    fill="#001FB0"
                  ></path>{" "}
                </g>
              </svg>
              <input
                className="flex-1 focus:outline-none !ml-3 poppins !text-lg transition-all duration-300"
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
              />
            </div>

            <button
              className={`${isError ? "animate-pulse" : "animate-none"} h-full flex w-1/6 items-center justify-center text-white bg-[#0019B1] !rounded-xl scale-100 active:scale-95 transition-all duration-100`}
              onClick={() => handleSearch(inputValue)}
            >
              <svg
                className="w-10"
                viewBox="0 0 21 21"
                xmlns="http://www.w3.org/2000/svg"
                fill="#000000"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <g
                    fill="none"
                    fillRule="evenodd"
                    stroke="#ffffff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="translate(3 3)"
                  >
                    <path d="m6.5 10.5 3-3-3-3"></path>
                    <path
                      d="m5 3v9"
                      transform="matrix(0 1 -1 0 12.5 2.5)"
                    ></path>
                    <path d="m1.5 5.5v-3.0079176c0-1.10147263.89060277-1.99561512 1.99206673-1.99998427l7.95228497-.03160773c1.1045608-.00432011 2.0035361.8875515 2.0079175 1.99211231l.0398162 10.02918369c.0043323 1.1045608-.8875404 2.003535-1.9921012 2.0079309-.0026436 0-.0052873 0-.0079309 0h-7.9920533c-1.1045695 0-2-.8954305-2-2v-2.9897173"></path>
                  </g>
                </g>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* {(isSuccess || isError) &&
        (<div ref={queryDetailsRef} className="w-1/2 !z-101">
          {QueryDetails}
        </div>)
      } */}

      {/* <span className="absolute -top-5 text-xs py-1 px-4 bg-[#001FB0] text-white rounded-t-xl oswald">SEARCH</span> */}
    </div>
  );
}
