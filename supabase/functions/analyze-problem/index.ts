import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProblemPayload {
  problemId: string;
  title: string;
  description: string;
  category: string;
  location: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { problemId, title, description, category, location }: ProblemPayload = await req.json();

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not set on Supabase Edge Function secrets." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const prompt = `You are an AI civic problem analyst for JanSetu. Analyze the following civic report:
Title: ${title}
Category: ${category}
Location: ${location}
Description: ${description}

Return ONLY valid JSON matching this exact structure:
{
  "category": "${category}",
  "severity": "High" | "Medium" | "Low",
  "urgency": "High" | "Medium" | "Low",
  "summary": "1-2 sentence executive summary of the core issue",
  "affectedPopulation": "Estimated citizens impacted",
  "requiredSkills": ["Skill 1", "Skill 2"],
  "suggestedSolution": "Step-by-step recommended action plan"
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        }),
      }
    );

    const data = await res.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const structuredAnalysis = JSON.parse(textOutput);

    return new Response(JSON.stringify({ analysis: structuredAnalysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "AI Analysis Failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
