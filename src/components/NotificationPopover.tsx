import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export default function NotificationPopover() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-500" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[320px] p-0 shadow-lg border-gray-100">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h4 className="font-semibold text-gray-900">Notifications</h4>
                    <span className="text-xs text-gray-500">(0 total)</span>
                </div>
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    {/* Using an emoji/unicode approximation or a placeholder for the yellow bell image if I can't generate one. 
                For now, I'll use a styled lucide icon to mimic the yellow 3D bell in the screenshot 
                or I'd use an image tag if I had the asset. The user provided an image of the popover, 
                so I will try to style the Bell icon to look "3D yellow" or just use the text as requested.
             */}
                    <div className="mb-4 relative">
                        <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-20 rounded-full"></div>
                        <Bell className="h-12 w-12 text-yellow-400 fill-yellow-400 relative z-10" />
                    </div>
                    <h3 className="text-gray-900 font-medium mb-1">No notifications yet</h3>
                    <p className="text-sm text-gray-500">
                        Your reminder notifications will appear here
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
}
