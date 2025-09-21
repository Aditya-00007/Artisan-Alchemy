import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function CategoryNavigation() {
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  return (
    <nav className="bg-secondary">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex space-x-8 overflow-x-auto">
            {(categories as any[]).map((category: any) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="text-secondary-foreground hover:text-accent transition-colors font-medium whitespace-nowrap"
                data-testid={`link-category-${category.slug}`}
              >
                {category.name}
              </Link>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-secondary-foreground"
            data-testid="button-category-menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
