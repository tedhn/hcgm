import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { NextRequest } from "next/server";
import { NextResponse, userAgent } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const { device } = userAgent(request);
  const viewport = device.type === "mobile" ? "mobile" : "desktop";
  url.searchParams.set("viewport", viewport);
  return NextResponse.rewrite(url);
}


export function isAdmin(role : string){
  return role === "admin";
}