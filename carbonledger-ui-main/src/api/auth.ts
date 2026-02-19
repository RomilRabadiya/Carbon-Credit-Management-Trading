import { supabase } from "@/lib/supabase";
import { User } from "@/types";

export interface AuthResponse {
    token: string;
    user: User;
}

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    if (!data.user || !data.session) throw new Error("Login successful but no user/session returned");

    // Map Supabase user to our User type
    const user: User = {
        id: data.user.id, // Supabase ID is string
        email: data.user.email!,
        name: data.user.user_metadata.name || "User",
        role: data.user.user_metadata.role || "USER",
        organizationId: data.user.user_metadata.organizationId,
    };

    return {
        token: data.session.access_token,
        user,
    };
};

export const registerApi = async (email: string, password: string, userData: Partial<User>): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: userData.name,
                role: userData.role,
                organizationId: userData.organizationId,
            },
        },
    });

    if (error) throw error;
    if (!data.user || !data.session) throw new Error("Registration successful but no user/session returned. Check if email confirmation is enabled.");

    const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata.name,
        role: data.user.user_metadata.role,
        organizationId: data.user.user_metadata.organizationId,
    };

    return {
        token: data.session.access_token,
        user,
    };
};
