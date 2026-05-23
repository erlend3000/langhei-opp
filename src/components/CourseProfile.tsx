import Image from "next/image";

export function CourseProfile({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src="/images/course-profile.svg"
        alt="Løypeprofil Langhei Opp - fra 31 moh til 88 moh over 2180 meter"
        width={3374}
        height={600}
        className="w-full h-auto"
        priority
      />
    </div>
  );
}
