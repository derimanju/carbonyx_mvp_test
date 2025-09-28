// Supabase 전용 간단한 폼 처리
// ========================================

// 폼 데이터 유효성 검사
function validateFormData(data) {
    const errors = [];

    // 필수 필드 검사
    if (!data.companyName || data.companyName.trim().length < 2) {
        errors.push('기업명을 2글자 이상 입력해주세요.');
    }

    if (!data.contactName || data.contactName.trim().length < 2) {
        errors.push('담당자명을 2글자 이상 입력해주세요.');
    }

    if (!data.phone || !validatePhoneFormat(data.phone)) {
        errors.push('올바른 전화번호를 입력해주세요. (예: 010-1234-5678)');
    }

    if (data.email && !validateEmailFormat(data.email)) {
        errors.push('올바른 이메일 형식을 입력해주세요.');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// 이메일 형식 검증
function validateEmailFormat(email) {
    if (!email) return true; // 이메일은 선택사항
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 전화번호 형식 검증
function validatePhoneFormat(phone) {
    if (!phone) return false;
    // 한국 전화번호 패턴 (01X-XXXX-XXXX, 02-XXX-XXXX 등)
    const phoneRegex = /^(\d{2,3}-\d{3,4}-\d{4}|\d{10,11})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Supabase 전용 폼 제출 처리
async function handleSupabaseFormSubmission(event) {
    event.preventDefault();

    console.log('📝 Supabase form submission started');

    try {
        // 폼 데이터 수집
        const formData = new FormData(event.target);
        const data = {
            companyName: formData.get('company-name')?.trim(),
            contactName: formData.get('contact-name')?.trim(),
            phone: formData.get('phone')?.trim(),
            email: formData.get('email')?.trim()
        };

        console.log('📊 Collected form data:', data);

        // 유효성 검사
        const validation = validateFormData(data);
        if (!validation.isValid) {
            alert('입력 오류:\n' + validation.errors.join('\n'));
            return;
        }

        // 제출 버튼 상태 변경
        const submitBtn = event.target.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '신청 처리 중...';
        submitBtn.disabled = true;

        // Supabase 연결 상태 확인
        console.log('🔍 Checking Supabase connection...');
        console.log('- window.CONFIG:', window.CONFIG);
        console.log('- window.supabase:', !!window.supabase);
        console.log('- window.SupabaseClient:', !!window.SupabaseClient);

        if (!window.SupabaseClient) {
            throw new Error('Supabase client is not initialized');
        }

        if (!window.SupabaseClient.savePreRegistration) {
            throw new Error('savePreRegistration function is not available');
        }

        // Supabase에 데이터 저장
        console.log('🔄 Submitting to Supabase...');
        const result = await window.SupabaseClient.savePreRegistration(data);

        console.log('📤 Supabase result:', result);

        if (result.success) {
            alert('✅ 사전 신청이 완료되었습니다!\n전문가가 곧 연락드리겠습니다.');
            event.target.reset();
            console.log('✅ Form submission successful');
        } else {
            throw new Error(result.error || 'Unknown Supabase error');
        }

    } catch (error) {
        console.error('❌ Form submission error:', error);

        // 사용자에게 명확한 오류 메시지 표시
        let userMessage = '신청 처리 중 오류가 발생했습니다.\n\n';

        if (error.message.includes('not initialized')) {
            userMessage += '시스템 초기화 중입니다. 잠시 후 다시 시도해주세요.\n\n';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            userMessage += '네트워크 연결을 확인해주세요.\n\n';
        } else {
            userMessage += `오류 내용: ${error.message}\n\n`;
        }

        userMessage += '문제가 지속되면 아래로 직접 연락해주세요:\n';
        userMessage += '📞 전화: 1588-0000\n';
        userMessage += '📧 이메일: contact@carbonyx.co.kr';

        alert(userMessage);

    } finally {
        // 버튼 상태 복원
        const submitBtn = event.target.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}

// 연결 테스트 함수
async function testSupabaseConnection() {
    console.log('🧪 Testing Supabase connection...');

    try {
        if (!window.CONFIG) {
            throw new Error('CONFIG not loaded');
        }

        if (!window.supabase) {
            throw new Error('Supabase library not loaded');
        }

        if (!window.SupabaseClient) {
            throw new Error('SupabaseClient not initialized');
        }

        // 연결 테스트
        const result = await window.SupabaseClient.testConnection();
        console.log('🔍 Connection test result:', result);
        return result;

    } catch (error) {
        console.error('❌ Connection test failed:', error);
        return { success: false, error: error.message };
    }
}

// 전역 함수로 노출
window.handleSupabaseFormSubmission = handleSupabaseFormSubmission;
window.testSupabaseConnection = testSupabaseConnection;

console.log('📋 Simple Supabase form handler loaded');