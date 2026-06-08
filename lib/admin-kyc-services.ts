import { supabase } from './supabase'
import { requireAdmin } from './admin-utils'

// Admin KYC Services
export const adminKYCService = {
  getAllKYCSubmissions: async (filters?: { status?: string }) => {
    await requireAdmin()
    let query = supabase
      .from('kyc_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query
    if (error) throw error

    // Get user profiles
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((s: any) => s.user_id).filter(Boolean))]
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, username, first_name, last_name, email')
          .in('id', userIds)

        if (!profilesError && profiles) {
          const profilesMap = new Map(profiles.map((p: any) => [p.id, p]))
          return data.map((s: any) => ({
            ...s,
            user: s.user_id ? profilesMap.get(s.user_id) || null : null
          }))
        }
      }
    }

    return data || []
  },

  getKYCSubmission: async (submissionId: number) => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('kyc_submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (error) throw error

    // Get user profile
    if (data && data.user_id) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, username, first_name, last_name, email')
        .eq('id', data.user_id)
        .single()

      return {
        ...data,
        user: profile || null
      }
    }

    return data
  },

  approveKYCSubmission: async (submissionId: number, adminNotes?: string) => {
    await requireAdmin()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get the KYC submission
    const { data: submission, error: fetchError } = await supabase
      .from('kyc_submissions')
      .select('user_id, status')
      .eq('id', submissionId)
      .single()

    if (fetchError || !submission) {
      throw new Error('KYC submission not found')
    }

    if (submission.status === 'approved') {
      throw new Error('This KYC submission is already approved')
    }

    if (submission.status === 'rejected') {
      throw new Error('Cannot approve a rejected KYC submission')
    }

    // Update KYC submission status
    const { data: updatedSubmission, error: updateError } = await supabase
      .from('kyc_submissions')
      .update({
        status: 'approved',
        admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
      .select()
      .single()

    if (updateError) throw updateError

    // Create notification for user (with email alert)
    try {
      const { notificationService } = await import('./supabase-services')
      await notificationService.createNotification(
        submission.user_id,
        'KYC Verification Approved',
        'Your KYC verification has been approved. You can now access all features.'
      )
    } catch (notifError) {
      console.warn('Failed to create notification:', notifError)
    }

    return updatedSubmission
  },

  rejectKYCSubmission: async (submissionId: number, rejectionReason: string, adminNotes?: string) => {
    await requireAdmin()
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error('Rejection reason is required')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get the KYC submission
    const { data: submission, error: fetchError } = await supabase
      .from('kyc_submissions')
      .select('user_id, status')
      .eq('id', submissionId)
      .single()

    if (fetchError || !submission) {
      throw new Error('KYC submission not found')
    }

    if (submission.status === 'approved') {
      throw new Error('Cannot reject an approved KYC submission')
    }

    // Update KYC submission status
    const { data: updatedSubmission, error: updateError } = await supabase
      .from('kyc_submissions')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', submissionId)
      .select()
      .single()

    if (updateError) throw updateError

    // Create notification for user (with email alert)
    try {
      const { notificationService } = await import('./supabase-services')
      await notificationService.createNotification(
        submission.user_id,
        'KYC Verification Rejected',
        `Your KYC verification has been rejected. Reason: ${rejectionReason}. Please resubmit with corrected information.`
      )
    } catch (notifError) {
      console.warn('Failed to create notification:', notifError)
    }

    return updatedSubmission
  },

  markUnderReview: async (submissionId: number) => {
    await requireAdmin()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('kyc_submissions')
      .update({
        status: 'under_review',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', submissionId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

