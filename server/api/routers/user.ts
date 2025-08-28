import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server';
import { userRoleEnum, userStatusEnum } from '@/datatypes/schemas/user';

export const userRouter = createTRPCRouter({
  // List all users
  list: protectedProcedure
    .input(z.object({
      role: userRoleEnum.optional(),
      status: userStatusEnum.optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('profiles')
        .select(`
          *,
          users!auth.users(*)
        `)
        .order('created_at', { ascending: false });

      if (input?.role) {
        query = query.eq('role', input.role);
      }

      if (input?.status) {
        query = query.eq('status', input.status);
      }

      if (input?.search) {
        query = query.or(`name.ilike.%${input.search}%,email.ilike.%${input.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    }),

  // Get user by ID
  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('users')
        .select(`
          *,
          user_profiles(*)
        `)
        .eq('id', input)
        .single();

      if (error) throw error;
      return data;
    }),

  // Get current user
  getCurrent: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await ctx.supabase
        .from('users')
        .select(`
          *,
          user_profiles(*)
        `)
        .eq('id', ctx.session.user.id)
        .single();

      if (error) throw error;
      return data;
    }),

  // Create new user
  create: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(1, "Name is required"),
      role: userRoleEnum.default('user'),
      status: userStatusEnum.default('active'),
      phone: z.string().nullable(),
      department: z.string().nullable(),
      avatar_url: z.string().url().nullable(),
      profile: z.object({
        name: z.string().min(1, "Name is required"),
        phone: z.string().nullable(),
        unit: z.string().nullable(),
        segment: z.string().nullable(),
        division: z.string().nullable(),
        legal_entity: z.string().nullable(),
        isActive: z.boolean().default(true),
        role: z.string().nullable(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const { data: existingUser } = await ctx.supabase
        .from('profiles')
        .select('id')
        .eq('email', input.email)
        .single();

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create user record
      const { data: user, error: userError } = await ctx.supabase
        .from('profiles')
        .insert({
          id: input.email, // Using email as ID for now, you might want to generate UUID
          email: input.email,
          name: input.name,
          role: input.role,
          status: input.status,
          phone: input.phone,
          department: input.department,
          avatar_url: input.avatar_url,
        })
        .select()
        .single();

      if (userError) throw userError;

      // Create profile if provided
      if (input.profile) {
        const { error: profileError } = await ctx.supabase
          .from('user_profiles')
          .insert({
            userid: user.id,
            name: input.profile.name,
            phone: input.profile.phone,
            unit: input.profile.unit,
            segment: input.profile.segment,
            division: input.profile.division,
            legal_entity: input.profile.legal_entity,
            isActive: input.profile.isActive,
            role: input.profile.role,
          });

        if (profileError) throw profileError;
      }

      return user;
    }),

  // Update user
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      email: z.string().email().optional(),
      name: z.string().min(1, "Name is required").optional(),
      role: userRoleEnum.optional(),
      status: userStatusEnum.optional(),
      phone: z.string().nullable().optional(),
      department: z.string().nullable().optional(),
      avatar_url: z.string().url().nullable().optional(),
      profile: z.object({
        name: z.string().min(1, "Name is required").optional(),
        phone: z.string().nullable().optional(),
        unit: z.string().nullable().optional(),
        segment: z.string().nullable().optional(),
        division: z.string().nullable().optional(),
        legal_entity: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
        role: z.string().nullable().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, profile, ...userData } = input;

      // Update user record
      const { data: user, error: userError } = await ctx.supabase
        .from('auth.users')
        .update({ 
          ...userData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (userError) throw userError;

      // Update or create profile if provided
      if (profile) {
        const { error: profileError } = await ctx.supabase
          .from('profiles')
          .upsert({
            userid: id,
            name: profile.name || user.name || '',
            phone: profile.phone,
            unit: profile.unit,
            segment: profile.segment,
            division: profile.division,
            legal_entity: profile.legal_entity,
            isActive: profile.isActive,
            role: profile.role,
          });

        if (profileError) throw profileError;
      }

      return user;
    }),

  // Delete user
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // Delete profile first
      await ctx.supabase
        .from('user_profiles')
        .delete()
        .eq('userid', input);

      // Delete user
      const { error } = await ctx.supabase
        .from('users')
        .delete()
        .eq('id', input);

      if (error) throw error;
      return { success: true };
    }),

  // Change user status
  changeStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: userStatusEnum,
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('profiles')
        .update({
          status: input.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  // Change user role
  changeRole: protectedProcedure
    .input(z.object({
      id: z.string(),
      role: userRoleEnum,
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('profiles')
        .update({
          role: input.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  // Get users by role
  getByRole: publicProcedure
    .input(userRoleEnum)
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('profiles')
        .select(`
          *,
          user_profiles(*)
        `)
        .eq('role', input)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data;
    }),

  // Get users by department
  getByDepartment: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('users')
        .select(`
          *,
          profiles(*)
        `)
        .eq('department', input)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data;
    }),

  checkUserExists: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('profiles')
        .select('*')
        .eq('email', input)
        .maybeSingle();

      if (error) throw error;

      if(data){

        const result = await ctx.supabase.auth.signInWithOtp({
          email: input,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify`,
            shouldCreateUser: true,
          },
        });

        console.log(result);

        if(result.error){
          throw new Error(result.error.message);
        }

        return { exists: true, email: input, result: result };
      }else{
        return { exists: false, email: input };
      }
    }),

  me: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new Error('Not authenticated');
      }

      console.log(ctx.session);

      const { data, error } = await ctx.supabase
        .from('profiles')
        .select('*')
        .eq('id', ctx.session.user.id)
        .single();

      if (error) throw error;
      return data;
    }),

  checkSession: protectedProcedure
  .mutation(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await ctx.supabase.auth.getUser();

    console.log(data);

    if (error) throw error;
    return { user: data.user }  ;
  }),


});
