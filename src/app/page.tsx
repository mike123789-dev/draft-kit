"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-8">
      <Card className="w-full max-w-sm py-8">
        <CardHeader className="px-8">
          <CardTitle>Counter App</CardTitle>
          <CardDescription>디자인 시스템 토큰을 적용한 기본 카운터</CardDescription>
        </CardHeader>

        <CardContent className="px-8 py-10">
          <p
            aria-live="polite"
            className="text-center text-4xl font-semibold tracking-tight text-foreground"
          >
            {count}
          </p>
        </CardContent>

        <CardFooter className="justify-center gap-3 px-8 py-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-w-11 text-lg"
            onClick={() => setCount((prev) => prev - 1)}
          >
            -
          </Button>
          <Button
            type="button"
            size="lg"
            className="min-w-11 text-lg"
            onClick={() => setCount((prev) => prev + 1)}
          >
            +
          </Button>
          <Button type="button" variant="secondary" onClick={() => setCount(0)}>
            reset
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
