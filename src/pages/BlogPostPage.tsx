import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// --- Markdown & Syntax Highlighting ---
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // Or your preferred theme
import configuredHljs from '@/lib/syntaxHighlighter'; // <-- OPTIMIZATION: Import our custom highlighter

// --- Layout & UI Components ---
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, User, Calendar, Tag, AlertTriangle, FileQuestion, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// --- Appwrite & State ---
import { getBlogPostBySlug, deleteBlogPost, BlogPost } from '@/lib/appwrite';
import { useAuthStore } from '@/store/authStore';

// --- Helper Function ---
const formatDate = (dateInput: string | Date | undefined): string => {
    if (!dateInput) return 'Unknown date';
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) {
        return 'Invalid date format';
    }
};

const FALLBACK_AUTHOR = 'MamaSaheli Team';

// --- Main Component ---
const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, isAuthenticated } = useAuthStore();

    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const isAdmin = isAuthenticated && Array.isArray(user?.labels) && user.labels.includes('admin');

    const fetchPost = useCallback(async () => {
        if (!slug) {
            setError("Blog post identifier is missing.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const fetchedPost = await getBlogPostBySlug(slug);
            if (fetchedPost) {
                setPost(fetchedPost);
            } else {
                setError(`Blog post "${slug}" was not found.`);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(errorMessage);
            toast({ title: "Error Loading Post", description: errorMessage, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [slug, toast]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    const handleDeletePost = async (): Promise<void> => {
        if (!post?.$id || !isAdmin) {
            toast({ title: "Deletion Prevented", description: "Missing post ID or insufficient permissions.", variant: "destructive" });
            return;
        }
        setIsDeleting(true);
        try {
            await deleteBlogPost(post.$id);
            toast({ title: "Post Deleted", description: `"${post.title}" has been successfully deleted.` });
            navigate('/resources');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Could not delete the post.";
            toast({ title: "Deletion Failed", description: errorMessage, variant: "destructive" });
            setIsDeleting(false);
        }
    };

    // --- Render Functions for Readability ---

    const renderLoading = () => (
        <MainLayout>
            <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
                <Loader2 className="h-10 w-10 animate-spin text-mamasaheli-primary" />
                <span className="sr-only">Loading blog post...</span>
            </div>
        </MainLayout>
    );

    const renderError = () => {
        const isNotFound = error?.toLowerCase().includes("not found");
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center px-4 py-16">
                    {isNotFound ? <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" /> : <AlertTriangle className="h-12 w-12 text-destructive mb-4" />}
                    <h2 className="text-2xl font-semibold mb-2">{isNotFound ? "Post Not Found" : "Error Loading Post"}</h2>
                    <p className="text-muted-foreground max-w-md mb-6">{error}</p>
                    <Button variant="outline" onClick={() => navigate('/resources')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resources
                    </Button>
                </div>
            </MainLayout>
        );
    };

    const renderPost = (post: BlogPost) => (
        <MainLayout>
            <div className="bg-gradient-to-b from-white to-mamasaheli-light/30 dark:from-gray-900 dark:to-gray-800/30">
                <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
                    <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/resources')} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Resources
                        </Button>
                        {isAdmin && (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => navigate(`/edit-blog/${post.slug}`)} disabled={isDeleting} aria-label={`Edit post titled ${post.title}`}>
                                    <Edit className="mr-1.5 h-4 w-4" /> Edit
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" disabled={isDeleting} aria-label={`Delete post titled ${post.title}`}>
                                            {isDeleting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1.5 h-4 w-4" />}
                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete the blog post titled "<span className="font-semibold">{post.title}</span>". This action cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeletePost} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                                {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Yes, delete post"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                    <header className="mb-10 md:mb-12 border-b border-mamasaheli-primary/20 dark:border-gray-700/50 pb-8">
                        {post.category && (
                            <Link to={`/resources?category=${encodeURIComponent(post.category)}`} className="inline-block mb-4 group">
                                <Badge variant="default" className="text-sm px-3 py-1 rounded-full bg-mamasaheli-light text-mamasaheli-primary group-hover:bg-mamasaheli-primary/20 transition-colors">
                                    <Tag className="mr-1.5 h-4 w-4" /> {post.category}
                                </Badge>
                            </Link>
                        )}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-gray-100">{post.title}</h1>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground dark:text-gray-400">
                            <div className="flex items-center"><User className="mr-1.5 h-4 w-4" /><span>By {post.author || FALLBACK_AUTHOR}</span></div>
                            <div className="flex items-center"><Calendar className="mr-1.5 h-4 w-4" /><time dateTime={post.publishedAt || post.$createdAt}>{formatDate(post.publishedAt || post.$createdAt)}</time></div>
                        </div>
                    </header>
                    {post.imageUrl && (
                        <figure className="my-10 md:my-12 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                            <img
                                src={post.imageUrl}
                                alt={`Cover image for ${post.title}`}
                                className="w-full h-auto max-h-[500px] object-cover"
                                loading="lazy" // <-- OPTIMIZATION: Lazy load the image
                            />
                        </figure>
                    )}
                    <div className="max-w-3xl mx-auto">
                        <div className="prose lg:prose-lg dark:prose-invert max-w-none prose-img:rounded-lg prose-a:font-medium hover:prose-a:text-mamasaheli-accent dark:prose-a:text-blue-400">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[
                                    // --- OPTIMIZATION: Use the custom-configured highlighter ---
                                    [rehypeHighlight, { hljs: configuredHljs, ignoreMissing: true }],
                                    rehypeRaw
                                ]}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                </article>
            </div>
        </MainLayout>
    );

    // --- Main Render Logic ---
    if (isLoading) return renderLoading();
    if (error) return renderError();
    if (!post) return renderError(); // Treat null post after loading as an error/not found
    
    return renderPost(post);
};

export default BlogPostPage;