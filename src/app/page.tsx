import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <div className="relative w-24 h-24 md:w-32 md:h-32">
        <img
          src="/logo.svg"
          alt="Z.ai Logo"
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Z.ai DevOps</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          AI-powered development orchestration with Next.js and modern tooling
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>Omnior Orchestrator</CardTitle>
            <CardDescription>
              AI DevOps pipeline for automated web application generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/orchestrator">
              <Button className="w-full">Open Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>WebSocket Examples</CardTitle>
            <CardDescription>
              Real-time communication examples and demos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/examples/websocket">
              <Button className="w-full" variant="outline">View Examples</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Health Check</CardTitle>
            <CardDescription>
              Monitor system status and API endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/api/health">
              <Button className="w-full" variant="outline">Check Health</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}