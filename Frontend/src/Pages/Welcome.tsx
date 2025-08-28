import { Button } from "@/components/ui/button";
import "./Pages.css";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Users, Zap, Shield, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-card to-background">
        <div className="absolute inset-0 bg-[url('/chat-background-image.png')] opacity-12"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              Gufta-Gu
            </h1>
            <p className="caveatFont text-xl md:text-4xl font-light text-muted-foreground mb-8 leading-relaxed">
              Where conversations come alive and connections flourish. Join
              thousands of people sharing stories, ideas, and moments that
              matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to={"/auth"}>
                <Button
                  size="lg"
                  className="text-lg px-8 cursor-pointer py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Start Chatting Now
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="cursor-pointer text-lg py-5 px-6 border-3  border-green-800 rounded-full bg-transparent"
              >
                <Users className="mr-2 h-5 w-5" />
                Explore Communities
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center Cormorant-Garamond mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Gufta-Gu?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience chatting like never before with our innovative features
              designed for meaningful connections.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Lightning Fast</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time messaging with zero lag. Your conversations flow as
                  naturally as face-to-face talks.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                  <Shield className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">
                  Secure & Private
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  End-to-end encryption ensures your conversations stay between
                  you and your friends. Always.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">
                  Community Driven
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Join vibrant communities, share interests, and build lasting
                  friendships with like-minded people.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-xl text-muted-foreground">
              Thousands of people are already connecting on Gufta-Gu
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="container mx-auto px-4 Cormorant-Garamond text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-2xl font-semibold text-muted-foreground mb-8 leading-relaxed">
              Join Gufta-Gu today and discover a world of meaningful
              conversations, lasting friendships, and vibrant communities
              waiting for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to={"/auth"}>
                <Button
                  size="lg"
                  className="text-lg px-10 py-6 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer duration-300"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Join Gufta-Gu Free
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-10 py-6 rounded-full bg-transparent cursor-pointer"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-primary">Gufta-Gu</h3>
            <p className="text-muted-foreground mb-6">
              Connecting hearts, one conversation at a time.
            </p>
            <div className="flex justify-center space-x-6">
              <Button variant="ghost" size="sm">
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm">
                Terms of Service
              </Button>
              <Button variant="ghost" size="sm">
                Contact Us
              </Button>
            </div>
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                © 2025 Gufta-Gu. Made with ❤️ for bringing people together.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
