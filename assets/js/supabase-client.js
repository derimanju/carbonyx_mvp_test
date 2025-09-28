// Supabase 클라이언트 초기화 및 데이터베이스 연동

let supabase;

// Supabase 클라이언트 초기화
function initSupabase() {
    console.log('🔧 Initializing Supabase client...');
    console.log('- CONFIG.SUPABASE_URL:', CONFIG.SUPABASE_URL);
    console.log('- CONFIG.SUPABASE_ANON_KEY present:', !!CONFIG.SUPABASE_ANON_KEY);

    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase library not loaded');
        return false;
    }

    try {
        supabase = window.supabase.createClient(
            CONFIG.SUPABASE_URL,
            CONFIG.SUPABASE_ANON_KEY
        );

        console.log('✅ Supabase client created');
        console.log('- Client object:', !!supabase);
        console.log('- From method:', typeof supabase.from);

        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return false;
    }
}

// 연결 테스트
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase
            .from('pre_registrations')
            .select('count(*)')
            .limit(1);

        if (error) {
            console.warn('Connection test failed:', error);
            return false;
        }

        console.log('Supabase connection test successful');
        return true;
    } catch (error) {
        console.error('Connection test error:', error);
        return false;
    }
}

// 사전신청 데이터 저장
async function savePreRegistration(formData) {
    console.log('💾 savePreRegistration called with:', formData);

    if (!supabase) {
        console.error('❌ Supabase client not initialized');
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        const registrationData = {
            company_name: formData.companyName,
            contact_name: formData.contactName,
            phone: formData.phone,
            email: formData.email || null
        };

        console.log('📝 Prepared data for insertion:', registrationData);

        const { data, error } = await supabase
            .from('pre_registrations')
            .insert([registrationData])
            .select();

        console.log('📤 Supabase response:');
        console.log('- data:', data);
        console.log('- error:', error);

        if (error) {
            console.error('❌ Supabase error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            throw error;
        }

        console.log('✅ Registration saved successfully:', data);
        return { success: true, data: data[0] };

    } catch (error) {
        console.error('❌ Error saving registration:', error);
        return {
            success: false,
            error: error.message || 'Database save failed',
            details: error
        };
    }
}

// 시세 데이터 조회
async function getLatestMarketPrices() {
    if (!supabase) {
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        const { data, error } = await supabase
            .from('market_prices')
            .select('*')
            .eq('is_active', true)
            .order('updated_at', { ascending: false })
            .limit(1);

        if (error) {
            throw error;
        }

        return {
            success: true,
            data: data && data.length > 0 ? data[0] : null
        };
    } catch (error) {
        console.error('Error fetching market prices:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch market prices'
        };
    }
}

// 계산기 사용 로그 저장
async function logCalculatorUsage(generationInput, calculatedKcu, estimatedRevenue) {
    if (!supabase) {
        if (CONFIG.DEBUG) {
            console.warn('Calculator usage not logged: Supabase not initialized');
        }
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        const logData = {
            generation_input: parseFloat(generationInput),
            calculated_kcu: parseFloat(calculatedKcu),
            estimated_revenue: parseInt(estimatedRevenue)
        };

        const { data, error } = await supabase
            .from('calculator_usage')
            .insert([logData]);

        if (error) {
            throw error;
        }

        if (CONFIG.DEBUG) {
            console.log('Calculator usage logged:', logData);
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error logging calculator usage:', error);
        return {
            success: false,
            error: error.message || 'Failed to log calculator usage'
        };
    }
}

// 페이지 방문 로그 저장
async function logPageVisit(pagePath, referrer) {
    if (!supabase) {
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        const visitData = {
            page_path: pagePath || window.location.pathname,
            referrer: referrer || document.referrer || null,
            user_agent: navigator.userAgent,
            session_id: generateSessionId()
        };

        const { data, error } = await supabase
            .from('page_analytics')
            .insert([visitData]);

        if (error) {
            throw error;
        }

        if (CONFIG.DEBUG) {
            console.log('Page visit logged:', visitData);
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error logging page visit:', error);
        return {
            success: false,
            error: error.message || 'Failed to log page visit'
        };
    }
}

// 실시간 시세 업데이트 구독
function subscribeToMarketPrices(callback) {
    if (!supabase) {
        console.error('Cannot subscribe: Supabase not initialized');
        return null;
    }

    try {
        const subscription = supabase
            .channel('market_prices_changes')
            .on('postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'market_prices',
                    filter: 'is_active=eq.true'
                },
                (payload) => {
                    if (CONFIG.DEBUG) {
                        console.log('Market prices updated:', payload);
                    }
                    if (typeof callback === 'function') {
                        callback(payload);
                    }
                }
            )
            .subscribe();

        if (CONFIG.DEBUG) {
            console.log('Subscribed to market prices updates');
        }

        return subscription;
    } catch (error) {
        console.error('Error subscribing to market prices:', error);
        return null;
    }
}

// 세션 ID 생성 (간단한 UUID)
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 사전신청 데이터 조회 (관리자용)
async function getPreRegistrations(limit = 50, offset = 0) {
    if (!supabase) {
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        const { data, error, count } = await supabase
            .from('pre_registrations')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        return {
            success: true,
            data: data || [],
            total: count || 0
        };
    } catch (error) {
        console.error('Error fetching registrations:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch registrations'
        };
    }
}

// 시세 데이터 업데이트 (관리자용)
async function updateMarketPrices(priceData) {
    if (!supabase) {
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        // 기존 활성 데이터를 비활성화
        await supabase
            .from('market_prices')
            .update({ is_active: false })
            .eq('is_active', true);

        // 새로운 시세 데이터 추가
        const newPriceData = {
            min_price: parseInt(priceData.minPrice),
            avg_price: parseInt(priceData.avgPrice),
            max_price: parseInt(priceData.maxPrice),
            recommended_price: parseInt(priceData.recommendedPrice),
            daily_change: parseFloat(priceData.dailyChange || 0),
            is_active: true
        };

        const { data, error } = await supabase
            .from('market_prices')
            .insert([newPriceData])
            .select();

        if (error) {
            throw error;
        }

        if (CONFIG.DEBUG) {
            console.log('Market prices updated:', data);
        }

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error updating market prices:', error);
        return {
            success: false,
            error: error.message || 'Failed to update market prices'
        };
    }
}

// 데이터베이스 상태 확인
async function getSupabaseStatus() {
    const status = {
        connected: false,
        tablesExist: false,
        recordCount: 0,
        lastError: null
    };

    try {
        // 연결 테스트
        status.connected = await testSupabaseConnection();

        if (status.connected) {
            // 레코드 수 확인
            const { data, error } = await supabase
                .from('pre_registrations')
                .select('id', { count: 'exact' })
                .limit(1);

            if (!error) {
                status.tablesExist = true;
                status.recordCount = data ? data.length : 0;
            } else {
                status.lastError = error.message;
            }
        }
    } catch (error) {
        status.lastError = error.message;
        console.error('Status check error:', error);
    }

    return status;
}

// 에러 핸들링 유틸리티
function handleSupabaseError(error, context = '') {
    const errorMessage = error?.message || 'Unknown database error';
    const errorCode = error?.code || 'UNKNOWN';

    console.error(`Supabase Error ${context}:`, {
        message: errorMessage,
        code: errorCode,
        details: error
    });

    // 사용자 친화적 에러 메시지 반환
    const userFriendlyMessages = {
        'PGRST301': '데이터 조회 권한이 없습니다.',
        'PGRST202': '데이터를 찾을 수 없습니다.',
        '23505': '이미 등록된 정보입니다.',
        'CONNECTION_ERROR': '네트워크 연결을 확인해주세요.'
    };

    return userFriendlyMessages[errorCode] || '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

// 전역 함수로 노출
window.SupabaseClient = {
    init: initSupabase,
    testConnection: testSupabaseConnection,
    savePreRegistration,
    getLatestMarketPrices,
    logCalculatorUsage,
    logPageVisit,
    subscribeToMarketPrices,
    getPreRegistrations,
    updateMarketPrices,
    getStatus: getSupabaseStatus,
    handleError: handleSupabaseError
};

// 초기화 재시도 로직
let initRetryCount = 0;
const maxRetries = 3;

function attemptSupabaseInit() {
    console.log(`🔄 Supabase init attempt ${initRetryCount + 1}/${maxRetries}`);
    console.log('- window.CONFIG available:', !!window.CONFIG);
    console.log('- window.supabase available:', !!window.supabase);

    if (window.CONFIG && window.supabase) {
        const success = initSupabase();
        if (success) {
            console.log('✅ Supabase initialized successfully');
            return true;
        }
    }

    initRetryCount++;
    if (initRetryCount < maxRetries) {
        console.warn(`⚠️ Supabase init attempt ${initRetryCount}/${maxRetries} failed, retrying in ${initRetryCount}s...`);
        setTimeout(attemptSupabaseInit, 1000 * initRetryCount);
    } else {
        console.error('❌ Supabase initialization failed after multiple attempts');
        console.error('Available:', {
            CONFIG: !!window.CONFIG,
            supabase: !!window.supabase,
            configDetails: window.CONFIG
        });
    }
    return false;
}

// 자동 초기화 (페이지 로드 후)
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting Supabase initialization...');

    // 즉시 시도
    if (!attemptSupabaseInit()) {
        // 실패 시 지연 후 재시도
        setTimeout(attemptSupabaseInit, 500);
    }
});

// 수동 초기화 함수 (디버깅용)
window.manualInitSupabase = function() {
    console.log('🔧 Manual Supabase initialization triggered');
    initRetryCount = 0;
    return attemptSupabaseInit();
};