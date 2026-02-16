import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

export default function header() {
    return (
        <div className='absolute opacity-60 hover:opacity-100 transition-all duration-100 ease-in top-5 right-2 flex flex-col text-center text-gray-500 items-center gap-4'>
            <img className="w-30 transition-all duration-100 ease-in" src="./chai_logo_sub.png" alt="grid" />
            <div className='flex flex-col gap-2'>
                <Drawer direction="right">
                    <DrawerTrigger asChild>
                        <Button className="rounded-lg!" variant="outline">
                            <svg className='w-5' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M550.208 960H209.28A81.792 81.792 0 0 1 128 877.76V146.24A81.92 81.92 0 0 1 209.344 64h613.632a81.92 81.92 0 0 1 81.28 82.432v405.76a29.824 29.824 0 1 1-59.584 0V146.56a22.272 22.272 0 0 0-21.76-22.656H209.408a22.08 22.08 0 0 0-21.696 22.528v731.52a21.76 21.76 0 0 0 21.44 22.464h341.056a29.824 29.824 0 0 1 0.064 59.584z m196.352-600.96H285.824a29.824 29.824 0 1 1 0-59.712h460.8a29.824 29.824 0 1 1 0 59.712z m-204.8 156.8H285.824a29.824 29.824 0 1 1 0-59.712h255.936a29.824 29.824 0 1 1 0 59.648z m179.2 391.936c-101.12 0-183.424-83.84-183.424-186.624a29.824 29.824 0 1 1 59.712 0c0 70.016 55.552 126.976 123.584 126.976 17.408 0 34.24-3.712 50.048-10.88a29.888 29.888 0 0 1 24.768 54.336c-23.552 10.688-48.64 16.192-74.688 16.192z m153.6-156.8a29.824 29.824 0 0 1-29.824-29.824c0-70.016-55.552-126.976-123.648-126.976-16.32 0-32.384 3.2-47.36 9.6a29.888 29.888 0 0 1-23.424-54.912 180.224 180.224 0 0 1 70.784-14.336c101.12 0 183.424 83.84 183.424 186.624a30.016 30.016 0 0 1-29.952 29.824z m-204.8-104.576h-51.264a29.76 29.76 0 0 1-25.28-14.08 30.144 30.144 0 0 1-1.536-28.928l25.6-52.352a29.696 29.696 0 0 1 53.632 0l25.6 52.352a29.696 29.696 0 0 1-1.472 28.928 29.504 29.504 0 0 1-25.28 14.08z m127.552 269.568h-1.024a29.696 29.696 0 0 1-24.896-14.848l-25.6-44.288a29.888 29.888 0 0 1 23.808-44.672l58.048-4.032c11.392-0.704 22.144 5.12 27.904 14.848a30.016 30.016 0 0 1-1.024 31.616l-32.448 48.256a29.824 29.824 0 0 1-24.768 13.12z" fill="#9e9e9e"></path></g></svg>
                            Changelog
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Changelog</DrawerTitle>
                            <DrawerDescription>
                                <span>History of all changes done to ChAI™ - Data Portal</span>
                                <br /> 
                                <span className="italic">(<span className="text-blue-600">highlighted pointers</span> are future targets)</span>
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="no-scrollbar overflow-y-auto px-4">
                            <p>[05-02-2026] Backend: LangGraph framework for Orders data created for filtering DR & multi-param comparison.</p>
                            <p>[12-02-2026] UI: searchbar developed</p>
                            <p>[13-02-2026] UI: changelog, faq drawer added; DataTables table added for orders</p>
                            <p className="italic text-blue-600">[15-02-2026] UI: Develop query based displaying layout</p>
                            <p className="italic text-blue-600">[16-02-2026] Fetch and display appropriate params with styling + GSAP based graph animation </p>
                            <p className="italic text-blue-600">[Coming Soon...] Deploy for testing</p>
                            <p className="italic text-blue-600">[Coming Soon...] Backend: achieve filtering+comparison on rest of the data sources </p>
                            <p className="italic text-blue-600">[Coming Soon...] Backend: metrics tool calls (mean, median, etc...) + forecasting + ml methods support</p>
                            <p className="italic text-blue-600">[Coming Soon...] Frontend: display layouts for different query types</p>
                        </div>
                        <DrawerFooter>
                            <DrawerClose asChild>
                                <Button variant="outline">Return</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
                <Drawer direction="right">
                    <DrawerTrigger asChild>
                        <Button className="rounded-lg!" variant="outline">
                            <svg className='w-5' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M512 64C264.96 64 64 264.96 64 512s200.96 448 448 448 448-200.96 448-448-200.96-448-448-448z m0 831.744A384.128 384.128 0 0 1 128.256 512 384.128 384.128 0 0 1 512 128.256 384.128 384.128 0 0 1 895.744 512 384.192 384.192 0 0 1 512 895.744zM512 254.08a140.16 140.16 0 0 0-140.672 139.392 32.128 32.128 0 0 0 64.32 0c0-42.112 33.536-75.136 76.352-75.136 42.112 0 76.352 34.56 76.352 76.992 0 16-22.912 38.976-43.2 59.2-30.592 30.592-65.28 65.28-65.28 111.744v45.888a32.128 32.128 0 1 0 64.256 0v-45.888c0-19.84 23.68-43.52 46.464-66.304 29.056-29.056 62.08-62.016 62.08-104.64A141.12 141.12 0 0 0 512 254.08z m-48.192 500.928a48.192 48.192 0 1 0 96.384 0 48.192 48.192 0 0 0-96.384 0z" fill="#9e9e9e"></path></g></svg>
                            Help/FAQ
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Help / FAQs</DrawerTitle>
                            <DrawerDescription>Need help?</DrawerDescription>
                        </DrawerHeader>
                        <div className="no-scrollbar overflow-y-auto px-4">
                            1. tbd...
                        </div>
                        <DrawerFooter>
                            <DrawerClose asChild>
                                <Button variant="outline">Return</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    )
}