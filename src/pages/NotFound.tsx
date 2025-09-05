import { Button } from '@/components/ui/button';
import '../App.css';

const NotFoundSVG = () => (
  <svg width="517" height="517" viewBox="0 0 517 517" xmlns="http://www.w3.org/2000/svg">
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <path d="M258.5,517 C401.303,517 517,401.303 517,258.5 C517,115.697 401.303,0 258.5,0 C115.697,0 0,115.697 0,258.5 C0,401.303 115.697,517 258.5,517 Z" fill="#000000" fillOpacity="0.03" fillRule="nonzero"/>
      <text fontFamily="Arial-BoldMT, Arial" fontSize="200" fontWeight="bold" fill="#000000" fillOpacity="0.1">
        <tspan x="94" y="296">404</tspan>
      </text>
    </g>
  </svg>
);

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Large background SVG with animation */}
      <div className="fade-animation absolute left-1/2 top-1/2 z-[10] h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2 scale-[0.5] opacity-0 dark:[filter:invert(1)_hue-rotate(180deg)]">
        <NotFoundSVG />
      </div>
      
      {/* First SVG */}
      <div className="m-auto w-full max-w-[517px] select-none dark:[filter:invert(1)_hue-rotate(180deg)]">
        <NotFoundSVG />
      </div>
      
      {/* Second SVG */}
      <div className="m-auto w-full max-w-[517px] select-none dark:[filter:invert(1)_hue-rotate(180deg)]">
        <NotFoundSVG />
      </div>
      
      <div className="relative z-20 space-y-6 max-w-md mt-8">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">The page you're looking for doesn't exist or may have been moved.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <a href="/">Return Home</a>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
