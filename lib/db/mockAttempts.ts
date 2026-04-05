import supabase from '@/lib/supabaseClient';

export type MockAttempt = {
  id: string;
  user_id: string;
  qbank_id: string;
  current_index: number;
  answers: Record<string, number>;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
};

export async function loadLatestMockAttempt(qbankId: string) {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("mock_attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("qbank_id", qbankId)
    .is("completed_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as MockAttempt | null;
}

export async function saveMockAttempt(params: {
  attemptId?: string;
  qbankId: string;
  currentIndex: number;
  answers: Record<string, number>;
}) {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) throw new Error("Not signed in");

  const payload: any = {
    user_id: user.id,
    qbank_id: params.qbankId,
    current_index: params.currentIndex,
    answers: params.answers,
    updated_at: new Date().toISOString(),
  };

  if (params.attemptId) payload.id = params.attemptId;

  const { data, error } = await supabase
    .from("mock_attempts")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return data as MockAttempt;
}

export async function completeMockAttempt(attemptId: string) {
  const { error } = await supabase
    .from("mock_attempts")
    .update({ completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", attemptId);

  if (error) throw error;
}
