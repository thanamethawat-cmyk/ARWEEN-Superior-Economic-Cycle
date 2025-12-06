import { GoogleGenAI, Type } from "@google/genai";
import { ModelType } from '../types';

// Helper to get AI client - MUST be called inside functions to ensure key is present
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// 1. Thinking Mode: Strategic Logistics Optimization
export const optimizeLogistics = async (origin: string, destination: string, cargoDetails: string): Promise<any> => {
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: ModelType.Thinking,
      contents: `Analyze this logistics route as a Thai Transport Law & Logistics Expert.
      
      Context:
      - Origin: ${origin}
      - Destination: ${destination}
      - Cargo: ${cargoDetails}
      
      Task:
      1. Estimate route distance and time.
      2. Assess legal weight limits (Max Payload) for standard trucks in Thailand based on cargo.
      3. Calculate estimated carbon footprint and compare with industry average.
      4. Identify risks and provide strategic advice.

      Output Format: JSON object with this structure (NO Markdown, just JSON):
      {
        "route": {
          "distance_km": number,
          "duration_hours": number,
          "primary_highway": string,
          "risk_level": "Low" | "Medium" | "High"
        },
        "legal": {
          "vehicle_type_assumed": string,
          "max_legal_weight_tons": number,
          "current_cargo_weight_estimated_tons": number,
          "is_compliant": boolean,
          "compliance_status": "PASS" | "WARNING" | "ILLEGAL",
          "law_citation": string
        },
        "eco": {
          "carbon_emission_kg": number,
          "benchmark_average_emission_kg": number,
          "sustainability_rating": "A" | "B" | "C" | "D",
          "carbon_credit_potential_thb": number
        },
        "strategy": {
          "main_recommendation": string,
          "cost_saving_tip": string,
          "urgent_alerts": string[]
        }
      }
      
      Important: Ensure all string values (highway name, vehicle type, recommendation, tips, citation, alerts) are in Thai language (ภาษาไทย). The advice must be actionable for a truck driver or fleet manager in Thailand.`,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 8000 }, // Sufficient for analysis
      }
    });
    
    const text = response.text?.trim();
    if (!text) throw new Error("Empty response");
    
    // Sanitize and parse
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error) {
    console.error("Optimization error:", error);
    // Return a fallback structure if error occurs
    return {
      error: true,
      message: "ไม่สามารถประมวลผลแผนการขนส่งได้ โปรดตรวจสอบข้อมูลและลองใหม่อีกครั้ง"
    };
  }
};

// 2. Vision: Safety Analysis (Image or Video)
export const analyzeSafetyMedia = async (fileBase64: string, mimeType: string, prompt: string): Promise<string> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: ModelType.Vision,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64
            }
          },
          {
            text: `Acting as an Expert AI Safety Inspector for the ARWEEN Logistics Platform, analyze this visual data.
            
            User Context: "${prompt}"
            
            Instructions:
            1. Identify the subject (Vehicle, Road, Cargo, etc.).
            2. Detect any safety hazards, damages, or irregularities (e.g., dents, tire wear, unsecured cargo, traffic risks).
            3. Assess the severity level (Low / Medium / High / Critical).
            4. Provide actionable recommendations for the driver or fleet manager.
            
            Output: Provide a professional, concise report in Thai language (ภาษาไทย). Use bullet points for readability.`
          }
        ]
      }
    });
    return response.text || "ไม่พบความเสี่ยงหรือความผิดปกติจากการวิเคราะห์เบื้องต้น";
  } catch (error) {
    console.error("Safety analysis error:", error);
    return "ไม่สามารถวิเคราะห์ไฟล์สื่อได้ในขณะนี้ โปรดลองใหม่อีกครั้ง";
  }
};

// 3. Vision: Waybill Scanner (OCR & Extraction)
export const scanWaybill = async (fileBase64: string, mimeType: string): Promise<{ origin: string, destination: string, cargo: string } | null> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: ModelType.Vision,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64
            }
          },
          {
            text: `คุณคือผู้ช่วย AI สำหรับงานโลจิสติกส์ หน้าที่ของคุณคืออ่านข้อมูลจาก "ใบงาน" หรือ "ใบส่งของ" (Waybill/Invoice) ที่แนบมานี้
            
            กรุณาสกัดข้อมูลสำคัญและตอบกลับเป็น JSON ดังนี้ (ห้ามมี Markdown):
            {
              "origin": "สถานที่ต้นทาง/ผู้ส่ง (ระบุจังหวัดถ้ามี)",
              "destination": "สถานที่ปลายทาง/ผู้รับ (ระบุจังหวัดถ้ามี)",
              "cargo": "รายละเอียดสินค้าที่บรรทุก และน้ำหนักรวม (ถ้ามี)"
            }
            
            หากไม่พบข้อมูลส่วนใด ให้ใส่เป็น string ว่าง "" 
            แปลข้อมูลทั้งหมดเป็นภาษาไทยเพื่อให้คนขับรถเข้าใจง่าย`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text?.trim();
    if (!text) throw new Error("No text returned");
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Waybill OCR Error:", error);
    return null;
  }
};

// 4. Maps Grounding: Location Intelligence
export const queryLocationIntelligence = async (query: string, lat: number, long: number) => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: ModelType.Maps,
      contents: query + " (ตอบเป็นภาษาไทย พร้อมระบุตำแหน่งสถานที่จริง)",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: long
            }
          }
        }
      }
    });
    
    // Extract text
    const text = response.text || "ไม่พบข้อมูล";
    
    // Extract grounding chunks (URLs & Titles) safely
    const candidates = response.candidates;
    const groundingChunks = candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const locations = groundingChunks.map((chunk: any) => {
      // Try to extract maps data
      if (chunk.maps) {
        return {
          title: chunk.maps.title || "ตำแหน่งบนแผนที่",
          uri: chunk.maps.googleMapsUri || chunk.maps.uri,
          type: 'map' as const
        };
      }
      // Fallback to web data
      if (chunk.web) {
        return {
          title: chunk.web.title || "ข้อมูลเพิ่มเติม",
          uri: chunk.web.uri,
          type: 'web' as const
        };
      }
      return null;
    }).filter((item: any) => item !== null && item.uri) as { title: string; uri: string; type: 'map' | 'web' }[];

    return { text, locations };
  } catch (error) {
    console.error("Maps error:", error);
    return { text: "ไม่สามารถดึงข้อมูลตำแหน่งได้ในขณะนี้", locations: [] };
  }
};

// 5. Fast AI: Quick Chatbot (Optimized for Voice)
export const fastChat = async (message: string): Promise<string> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: ModelType.Fast,
      contents: message,
      config: {
        systemInstruction: "คุณคือ 'ARWEEN Voice Assistant' ผู้ช่วยอัจฉริยะสำหรับคนขับรถบรรทุก หน้าที่คือช่วยเหลือ แจ้งเตือนภัย และตอบคำถามเส้นทาง\n\nข้อกำหนดการตอบ:\n1. ตอบสั้น กระชับ (ไม่เกิน 2 ประโยค) เพื่อให้เหมาะกับการฟังขณะขับรถ\n2. ใช้น้ำเสียงกระตือรือร้น สุภาพ และเป็นกันเอง (แบบ Co-pilot มืออาชีพ)\n3. หากเป็นเรื่องฉุกเฉิน ให้ตอบทันทีและสั้นที่สุด\n4. ใช้ภาษาไทยเป็นหลัก"
      }
    });
    return response.text || "ขออภัย ฉันไม่เข้าใจคำถาม";
  } catch (error) {
    console.error("Chat error:", error);
    return "ระบบกำลังยุ่ง";
  }
};

// 6. Weather Intelligence (Enhanced for Tactical Map)
export interface WeatherData {
  temp: string;
  condition: 'CLEAR' | 'CLOUDY' | 'RAIN' | 'STORM' | 'FOG' | 'FLOOD';
  precipitation_mm: string;
  wind_speed: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  advice: string;
}

export const getWeatherInsight = async (lat: number, lng: number): Promise<WeatherData> => {
  const ai = getAiClient();
  try {
    // Note: responseMimeType: 'application/json' is NOT supported with tools (googleSearch)
    const response = await ai.models.generateContent({
      model: ModelType.Maps,
      contents: `Get real-time tactical weather data for lat:${lat}, lng:${lng} (Thailand).
      
      Return a valid JSON string ONLY (no markdown) with this schema:
      {
        "temp": "32°C",
        "condition": "RAIN", // Enum: CLEAR, CLOUDY, RAIN, STORM, FOG, FLOOD
        "precipitation_mm": "15 mm/hr",
        "wind_speed": "20 km/h",
        "risk_level": "MEDIUM", // LOW, MEDIUM, HIGH
        "advice": "Short driving advice in Thai"
      }
      Use Google Search for latest data.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const text = response.text?.trim();
    if (!text) throw new Error("No weather data");
    
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Weather error:", error);
    return { 
      temp: "--°C", 
      condition: "CLOUDY", 
      precipitation_mm: "0 mm",
      wind_speed: "0 km/h",
      risk_level: "LOW",
      advice: "ไม่สามารถเชื่อมต่อดาวเทียมสภาพอากาศได้" 
    };
  }
};

// 7. Autocomplete Suggestions
export const getAutocompleteSuggestions = async (query: string, lat: number, lng: number): Promise<string[]> => {
  const ai = getAiClient();
  try {
    // Note: responseMimeType is NOT supported with tools (googleMaps)
    const response = await ai.models.generateContent({
      model: ModelType.Maps,
      contents: `List 4 specific real-world place names or POIs matching "${query}" near lat:${lat}, lng:${lng}. 
      Return ONLY a valid JSON array of strings (e.g. ["Place A", "Place B"]). 
      No markdown formatting.
      IMPORTANT: Return place names in Thai language (ภาษาไทย).`,
      config: {
        tools: [{ googleMaps: {} }],
      }
    });
    
    const text = response.text?.trim();
    if (!text) return [];
    
    // Clean potential markdown wrapping
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    // Fail silently for autocomplete to avoid disrupting UX
    return [];
  }
};

// 8. Financial Analysis for Driver Wallet
export interface FinancialAdvice {
  health_score: number;
  status: string;
  summary: string;
  recommended_actions: string[];
}

export const analyzeFinancialHealth = async (incomeData: any[], transactions: any[]): Promise<FinancialAdvice | null> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: ModelType.Thinking, // Use Thinking model for deep financial advice
      contents: `
        Analyze the financial health of this truck driver based on the following data:
        
        Weekly Income (THB): ${JSON.stringify(incomeData)}
        Recent Transactions: ${JSON.stringify(transactions)}
        
        Role: Financial Advisor for Logistics Workers (Structural Exit Program).
        Task: Provide a structured financial health report in Thai (ภาษาไทย).
        
        Output JSON Format ONLY (No Markdown):
        {
          "health_score": number (0-100),
          "status": "Short description of status (e.g., ดีเยี่ยม, พอใช้, เสี่ยง)",
          "summary": "Concise summary of their financial situation (max 2 sentences)",
          "recommended_actions": ["Action 1", "Action 2", "Action 3"]
        }
      `,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });
    
    const text = response.text?.trim();
    if (!text) return null;
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error) {
    console.error("Financial analysis error:", error);
    return null;
  }
};

// 9. System Health Check for Admin Console
export interface SystemTelemetry {
  apiStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  aiLoad: number;
}

export const checkSystemHealth = async (): Promise<SystemTelemetry> => {
  const ai = getAiClient();
  const startTime = Date.now();
  try {
    // Minimal generation to check connectivity
    await ai.models.generateContent({
      model: ModelType.Fast,
      contents: "ping",
      config: { maxOutputTokens: 1 }
    });
    const latency = Date.now() - startTime;
    return {
      apiStatus: 'ONLINE',
      latencyMs: latency,
      aiLoad: Math.min(100, Math.round(latency / 10)) // Mock load based on latency
    };
  } catch (error) {
    console.error("Health Check Failed:", error);
    return {
      apiStatus: 'OFFLINE',
      latencyMs: 0,
      aiLoad: 0
    };
  }
};