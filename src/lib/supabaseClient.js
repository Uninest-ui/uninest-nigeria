import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mqvzkbzfusqrarmwuwwe.supabase.co'
const supabaseKey = 'sb_publishable_qBq-rRzVkx0gbpof1p6MfA_9gK0rdE5'

export const supabase = createClient(supabaseUrl, supabaseKey)
