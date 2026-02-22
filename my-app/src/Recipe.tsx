import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { fetchRecipes } from './fetchRecipes.ts';
import RecipeCard from './chatbot/RecipeCard';
import type { RecipeData } from './chatbot/types';

export interface Recipe {
    title: string;
    description: string;
    ingredients: string[];
    prep_time: string;
    cook_time: string;
    total_time: string;
    steps: string[];
}

type FolderState = {
    title:    string;
    subtitle: string;
    recipes:  RecipeData[];
    loading:  boolean;
    error:    string;
};

function toRecipeData(r: Recipe): RecipeData {
    const raw = r as unknown as {
        customary_ingredients?: string[];
        metric_ingredients?: string[];
    };
    return {
        title:                r.title,
        symptomHelp:          r.description,
        prepTime:             r.prep_time,
        cookTime:             r.cook_time,
        totalTime:            r.total_time,
        servings:             '',
        ingredientsCustomary: raw.customary_ingredients ?? r.ingredients ?? [],
        ingredientsMetric:    raw.metric_ingredients    ?? r.ingredients ?? [],
        instructions:         r.steps,
    };
}

function isRestricted(recipe: Recipe, restrictions: string[]): boolean {
    if (!restrictions.length) return false;
    const raw = recipe as unknown as { customary_ingredients?: string[] };
    const haystack = [
        recipe.title,
        recipe.description,
        ...(raw.customary_ingredients ?? recipe.ingredients ?? []),
    ].join(' ').toLowerCase();
    return restrictions.some(r => haystack.includes(r.toLowerCase()));
}

function readUser() {
    const stored = sessionStorage.getItem('user');
    const user   = stored ? JSON.parse(stored) : null;
    return {
        dx: (user?.diagnoses          ?? []) as string[],
        sx: (user?.symptoms            ?? []) as string[],
        dt: (user?.dietaryRestrictions ?? []) as string[],
    };
}

function buildInitialFolders(dx: string[], sx: string[]): FolderState[] {
    return [
        ...dx.map(d => ({
            title:    d.charAt(0).toUpperCase() + d.slice(1),
            subtitle: `Recipes tailored for ${d} management`,
            recipes:  [],
            loading:  true,
            error:    '',
        })),
        ...(sx.length ? [{
            title:    'Symptom Relief',
            subtitle: `Recipes addressing: ${sx.join(', ')}`,
            recipes:  [],
            loading:  true,
            error:    '',
        }] : []),
    ];
}

function Folder({ folder, isLoggedIn }: { folder: FolderState; isLoggedIn: boolean }) {
    const s: CSSProperties = {
        background:   '#dce3c7',
        border:       '1.5px solid #354a2f',
        borderRadius: '16px',
        padding:      '24px',
        marginBottom: '16px',
        fontFamily:   'Georgia, serif',
    };
    return (
        <div style={s}>
            <h2 style={{ color: '#354a2f', margin: '0 0 4px', fontSize: '20px', fontWeight: 700 }}>
                {folder.title}
            </h2>
            <p style={{ color: '#556B46', margin: '0 0 16px', fontSize: '13px' }}>
                {folder.subtitle}
            </p>
            {folder.loading && (
                <p style={{ color: '#354a2f', fontSize: '14px', fontStyle: 'italic' }}>
                    Generating your personalized wellness plan...
                </p>
            )}
            {folder.error && (
                <p style={{ color: '#7a2020', fontSize: '14px' }}>{folder.error}</p>
            )}
            {!folder.loading && !folder.error && folder.recipes.length === 0 && (
                <p style={{ color: '#556B46', fontSize: '14px' }}>No recipes available.</p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {folder.recipes.map((r, i) => (
                    <RecipeCard key={i} recipe={r} isLoggedIn={isLoggedIn} onSave={() => {}} />
                ))}
            </div>
        </div>
    );
}

function RecipeCalls() {
    // Lazy initializers — read sessionStorage once at mount, no useEffect setState
    const [generalFolder, setGeneralFolder] = useState<FolderState>({
        title:    'General Wellness',
        subtitle: 'Balanced recipes for everyday health and vitality',
        recipes:  [],
        loading:  true,
        error:    '',
    });
    const [profileFolders, setProfileFolders] = useState<FolderState[]>(() => {
        const { dx, sx } = readUser();
        return buildInitialFolders(dx, sx);
    });
    const [tab, setTab] = useState<'general' | 'profile'>('general');

    // Derived — no extra state needed
    const hasProfile = profileFolders.length > 0;
    const isLoggedIn = !!sessionStorage.getItem('user');

    // Only async work in the effect — no synchronous setState
    useEffect(() => {
        const { dx, sx, dt } = readUser();

        // General wellness
        void fetchRecipes([], [], dt)
            .then(res => setGeneralFolder(prev => ({
                ...prev,
                recipes: res.filter(r => !isRestricted(r, dt)).map(toRecipeData),
                loading: false,
            })))
            .catch(() => setGeneralFolder(prev => ({
                ...prev,
                loading: false,
                error: 'Could not load recipes. Please try again.',
            })));

        // Per-diagnosis folders
        dx.forEach((d, i) => {
            void fetchRecipes([d], [], dt)
                .then(res => setProfileFolders(prev =>
                    prev.map((f, j) => j === i
                        ? { ...f, recipes: res.filter(r => !isRestricted(r, dt)).map(toRecipeData), loading: false }
                        : f)
                ))
                .catch(() => setProfileFolders(prev =>
                    prev.map((f, j) => j === i
                        ? { ...f, loading: false, error: 'Could not load recipes.' }
                        : f)
                ));
        });

        // Symptom relief folder
        if (sx.length) {
            const sxIdx = dx.length;
            void fetchRecipes([], sx, dt)
                .then(res => setProfileFolders(prev =>
                    prev.map((f, j) => j === sxIdx
                        ? { ...f, recipes: res.filter(r => !isRestricted(r, dt)).map(toRecipeData), loading: false }
                        : f)
                ))
                .catch(() => setProfileFolders(prev =>
                    prev.map((f, j) => j === sxIdx
                        ? { ...f, loading: false, error: 'Could not load recipes.' }
                        : f)
                ));
        }
    }, []);

    const tabBtn = (active: boolean): CSSProperties => ({
        padding:      '8px 16px',
        border:       '1.5px solid #354a2f',
        borderRadius: '4px',
        background:   active ? '#354a2f' : 'transparent',
        color:        active ? 'white' : '#354a2f',
        fontFamily:   'Georgia, serif',
        fontSize:     '14px',
        fontWeight:   active ? 600 : 400,
        cursor:       'pointer',
    });

    return (
        <div style={{ fontFamily: 'Georgia, serif', padding: '24px' }}>
            <h1 style={{ color: '#354a2f', margin: '0 0 6px', fontSize: '28px', fontWeight: 700 }}>
                Wellness Recipes
            </h1>
            <p style={{ color: '#556B46', margin: '0 0 20px', fontSize: '14px' }}>
                Recipes curated for your health. Always consult a healthcare professional before making dietary changes.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button style={tabBtn(tab === 'general')} onClick={() => setTab('general')}>
                    General Wellness
                </button>
                {hasProfile && (
                    <button style={tabBtn(tab === 'profile')} onClick={() => setTab('profile')}>
                        Health Profile
                    </button>
                )}
            </div>

            {tab === 'general' && (
                <Folder folder={generalFolder} isLoggedIn={isLoggedIn} />
            )}

            {tab === 'profile' && profileFolders.map((folder, i) => (
                <Folder key={i} folder={folder} isLoggedIn={isLoggedIn} />
            ))}
        </div>
    );
}

export default RecipeCalls;
