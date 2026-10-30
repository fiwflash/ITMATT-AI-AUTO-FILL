// ==========================================
// 1. ตัวแปร Global & State
// ==========================================
let senderImageData = null;
let receiverImageData = null;
let singleImageData = null; 
let currentIntakeMode = 'SPLIT'; 

// ข้อมูลเบอร์โทรศัพท์ดั้งเดิมที่คลีนแล้ว เพื่อใช้เป็นฐานประมวลผล (Core Numbers)
let senderCoreTel = '';    // เบอร์ส่งแกนหลัก (ไม่มี 0 และไม่มีรหัสประเทศ)
let receiverCoreTel = '';  // เบอร์รับแกนหลัก (ไม่มี 0 และไม่มีรหัสประเทศ)

// สถานะการตั้งค่าฟอร์แมตเบอร์โทรศัพท์ (ตามแนวทางที่ 2)
// CC: 1 = Local(0), 2 = Intl+, 3 = Intl No-Plus
// Style: 1 = Formatted (มีขีด/วรรค), 2 = Digits Only (ตัวเลขล้วน)
let senderCCState = 1;
let senderStyleState = 1;

let receiverCCState = 1;
let receiverStyleState = 1;
// ==========================================
// CONFIGURATION
// ==========================================
const siteConfigs = {
    "DPOST": {
        urlDomain: "dpostinter.thailandpost.com",
        validPaths: ["/label/form", "/label"], 
        wrongPathMsg: "⚠️ กรุณาคลิกเข้าไปที่เมนู 'สร้างใบจ่าหน้า' ให้เรียบร้อยก่อนกดยืนยันครับ",
        fields: {
            sname: 'sname', stel: 'stel', semail: 'semail', spremise: 'spremise', 
            ssubdistrict: 'ssubdistrict', sdistrict: 'sdistrict', 
            sprovince: 'sprovince', spostalcode: 'spostalcode',
            rname: 'rname', rtel: 'rtel', remail: 'remail', premise: 'premise', 
            city: 'city', state: 'state', rpostcode: 'rpostcode'
        },
        countryBehavior: 'SEARCH_IN_OPTIONS' 
    },
    "CNIF": {
        urlDomain: "cnif.thailandpost.com",
        validPaths: ["/cn_interface/index"], 
        wrongPathMsg: "⚠️ กรุณาคลิกเข้าเมนู 'ITmatt' เพื่อสร้างจ่าหน้า ก่อนกดยืนยันครับ",
        fields: {
            sname: 'sname', stel: 'stel', semail: 'semail', spremise: 'spremise', 
            ssubdistrict: 'subdistrict', sdistrict: 'district', 
            sprovince: 'sprovince', spostalcode: 'spostalcode',
            rname: 'rname', rtel: 'rtel', remail: 'remail', premise: 'premise', 
            city: 'city', state: 'state', rpostcode: 'rpostcode'
        },
        countryBehavior: 'DIRECT_NG_MODEL' 
    }
};
// ฐานข้อมูลรหัสประเทศสากลเบื้องต้น (Fallback)
const countryCallingCodes = {
    'US': '1', 'CA': '1', 'GB': '44', 'AU': '61', 'JP': '81', 'CN': '86', 'SG': '65', 
    'HK': '852', 'TW': '886', 'KR': '82', 'MY': '60', 'TH': '66', 'IN': '91', 'DE': '49', 
    'FR': '33', 'IT': '39', 'ES': '34', 'NL': '31', 'CH': '41', 'NZ': '64', 'VN': '84',
    'AS': '1', 'FM': '691', 'GU': '1', 'MH': '692', 'MP': '1', 'PW': '680', 'PR': '1',
    'VI': '1', 'CU': '53'
};

// ITMATT/ePacket US destination selection rules from Thailand Post guidance.
// The 13 special destinations must be selected by their specific area name;
// only the 48 mainland states should use United States of America (USA).
const itmattDestinations = [
    {
        key: 'US',
        labelName: 'UNITED STATES OF AMERICA (USA)',
        selectionNames: ['UNITED STATES OF AMERICA', 'UNITED STATES', 'USA'],
        phoneCountryCode: 'US',
        aliases: ['US', 'USA', 'UNITED STATES', 'UNITED STATES OF AMERICA', 'MAINLAND USA', 'US MAINLAND']
    },
    { key: 'AK', labelName: 'ALASKA', selectionNames: ['ALASKA'], phoneCountryCode: 'US', aliases: ['AK', 'ALASKA'] },
    { key: 'AS', labelName: 'AMERICAN SAMOA', selectionNames: ['AMERICAN SAMOA'], phoneCountryCode: 'AS', aliases: ['AS', 'AMERICAN SAMOA'] },
    { key: 'FM', labelName: 'FEDERATED STATES OF MICRONESIA', selectionNames: ['FEDERATED STATES OF MICRONESIA', 'MICRONESIA'], phoneCountryCode: 'FM', aliases: ['FM', 'MICRONESIA', 'FEDERATED STATES OF MICRONESIA'] },
    { key: 'GU', labelName: 'GUAM', selectionNames: ['GUAM'], phoneCountryCode: 'GU', aliases: ['GU', 'GUAM'] },
    { key: 'GTMO', labelName: 'GUANTANAMO BAY', selectionNames: ['GUANTANAMO BAY'], phoneCountryCode: 'CU', aliases: ['GTMO', 'GUANTANAMO', 'GUANTANAMO BAY'] },
    { key: 'HI', labelName: 'HAWAII', selectionNames: ['HAWAII'], phoneCountryCode: 'US', aliases: ['HI', 'HAWAII'] },
    { key: 'MARIANAS', labelName: 'MARIANAS', selectionNames: ['MARIANAS'], phoneCountryCode: 'MP', aliases: ['MARIANAS', 'MARIANA ISLANDS'] },
    { key: 'MH', labelName: 'MARSHALL ISLANDS', selectionNames: ['MARSHALL ISLANDS'], phoneCountryCode: 'MH', aliases: ['MH', 'MARSHALL ISLANDS'] },
    { key: 'MP', labelName: 'NORTHERN MARIANA ISLANDS', selectionNames: ['NORTHERN MARIANA ISLANDS', 'NORTHERN MARIANAS'], phoneCountryCode: 'MP', aliases: ['MP', 'NORTHERN MARIANA ISLANDS', 'NORTHERN MARIANAS'] },
    { key: 'PW', labelName: 'PALAU', selectionNames: ['PALAU'], phoneCountryCode: 'PW', aliases: ['PW', 'PALAU'] },
    { key: 'PR', labelName: 'PUERTO RICO', selectionNames: ['PUERTO RICO'], phoneCountryCode: 'PR', aliases: ['PR', 'PUERTO RICO'] },
    { key: 'VI', labelName: 'VIRGIN ISLANDS (U.S.A.)', selectionNames: ['VIRGIN ISLANDS', 'VIRGIN ISLANDS (U.S.A.)', 'U.S. VIRGIN ISLANDS'], phoneCountryCode: 'VI', aliases: ['VI', 'VIRGIN ISLANDS', 'VIRGIN ISLANDS (U.S.A.)', 'US VIRGIN ISLANDS', 'U.S. VIRGIN ISLANDS'] },
    { key: 'WAKE', labelName: 'WAKE ISLANDS', selectionNames: ['WAKE ISLANDS', 'WAKE ISLAND'], phoneCountryCode: 'US', aliases: ['WAKE', 'WAKE ISLAND', 'WAKE ISLANDS'] }
];

function normalizeDestinationText(value) {
    return String(value || '')
        .toUpperCase()
        .replace(/[.()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function resolveItmattDestination(value) {
    const normalized = normalizeDestinationText(value);
    if (!normalized) return null;

    return itmattDestinations.find(destination => {
        const candidates = [destination.key, destination.labelName, ...destination.selectionNames, ...destination.aliases];
        return candidates.some(candidate => normalizeDestinationText(candidate) === normalized);
    }) || null;
}

function getDestinationLabelName(value) {
    const destination = resolveItmattDestination(value);
    if (destination) return destination.labelName;
    return getCountryFullName(value);
}

function getDestinationPhoneCountryCode(value) {
    const destination = resolveItmattDestination(value);
    return destination ? destination.phoneCountryCode : String(value || '').toUpperCase();
}

function getDestinationSelectionTerms(value) {
    const destination = resolveItmattDestination(value);
    if (!destination) {
        const raw = String(value || '').trim().toUpperCase();
        return raw ? [raw] : [];
    }

    return [...new Set([
        destination.key,
        destination.labelName,
        ...destination.selectionNames,
        ...destination.aliases
    ].filter(Boolean).map(term => String(term).toUpperCase()))];
}

function isUsRelatedDestinationInput(value) {
    const normalized = normalizeDestinationText(value);
    if (!normalized) return false;
    if (/\b(US|USA|U S A|UNITED STATES|AMERICA|MAINLAND USA)\b/.test(normalized)) return true;

    return itmattDestinations
        .filter(destination => destination.key !== 'US')
        .some(destination => {
            const candidates = [destination.key, destination.labelName, ...destination.selectionNames, ...destination.aliases];
            return candidates.some(candidate => normalized.includes(normalizeDestinationText(candidate)));
        });
}

// ==========================================
// 2. ตรรกะประมวลผลและฟอร์แมตเบอร์โทรศัพท์ (Core Parser Logic)
// ==========================================

// 2.1 ถอดรหัสหาเบอร์โทรแกนกลางที่แท้จริง
function extractCoreNumber(phoneStr, countryCode = 'TH') {
    if (!phoneStr) return '';
    
    // 1. ลบสิ่งที่ไม่ใช่ตัวเลขออก ยกเว้นเครื่องหมายบวก +
    let cleaned = phoneStr.replace(/[^0-9+]/g, '');
    if (!cleaned) return '';

    const cc = (countryCallingCodes[countryCode.toUpperCase()] || '66');

    // 2. ตรวจหาและถอดรหัสประเทศต้นทางเพื่อหาเบอร์แกนหลัก
    if (cleaned.startsWith('+' + cc)) {
        return cleaned.substring(cc.length + 1);
    } else if (cleaned.startsWith(cc) && cleaned.length > cc.length + 2) {
        // เช่น 66812345678 -> 812345678
        return cleaned.substring(cc.length);
    } else if (cleaned.startsWith('0')) {
        // เช่น 0812345678 -> 812345678
        return cleaned.substring(1);
    }

    // ถ้าไม่มีแพทเทิร์นข้างต้น ให้ถือว่าตัวเลขที่เหลือคือแกนหลักทั้งหมด
    return cleaned.replace(/\+/g, '');
}

// 2.2 จัดหน้าตาเบอร์โทรศัพท์ตาม State ปัจจุบัน
function compilePhoneNumber(coreNum, ccState, styleState, countryCode = 'TH') {
    if (!coreNum) return '';
    
    const cc = (countryCallingCodes[countryCode.toUpperCase()] || '66');
    let phoneHead = '';

    // ส่วนหัวรหัสประเทศ
    if (ccState === 1) {
        phoneHead = '0';
    } else if (ccState === 2) {
        phoneHead = '+' + cc;
    } else if (ccState === 3) {
        phoneHead = cc;
    }

    // กรณีตัวเลขล้วน (Digits Only)
    if (styleState === 2) {
        return phoneHead + coreNum;
    }

    // กรณีจัดกลุ่มตัวเลขให้อ่านง่าย (Formatted)
    // อิงรูปแบบประเทศไทย 081-234-5678 หรือเบอร์บ้าน 02-123-4567
    let formattedBody = '';
    if (coreNum.length === 9) { // เบอร์มือถือ 9 หลักหลักไม่รวมศูนย์ (เช่น 812345678)
        formattedBody = coreNum.substring(0, 2) + '-' + coreNum.substring(2, 5) + '-' + coreNum.substring(5);
    } else if (coreNum.length === 8) { // เบอร์บ้าน 8 หลักไม่รวมศูนย์ (เช่น 21234567)
        formattedBody = coreNum.substring(0, 1) + '-' + coreNum.substring(1, 4) + '-' + coreNum.substring(4);
    } else {
        // เบอร์ต่างประเทศหรือยาวอื่นๆ ให้จัดกลุ่มทีละ 3-4 หลัก
        if (coreNum.length > 4) {
            const mid = Math.floor(coreNum.length / 2);
            formattedBody = coreNum.substring(0, mid) + '-' + coreNum.substring(mid);
        } else {
            formattedBody = coreNum;
        }
    }

    // รวมสัญลักษณ์เว้นวรรคให้อ่านงดงาม
    if (ccState === 1) {
        return '0' + formattedBody;
    } else {
        return phoneHead + ' ' + formattedBody;
    }
}

// 2.3 อัปเดต UI และคำสั่งแปลงเบอร์โทรศัพท์บนหน้าจอรวดเดียว
function applyPhoneFormatting() {
    const senderCCBtn = document.getElementById('btnSenderCC');
    const senderStyleBtn = document.getElementById('btnSenderSymbol');
    const receiverCCBtn = document.getElementById('btnReceiverCC');
    const receiverStyleBtn = document.getElementById('btnReceiverSymbol');

    const countryCodeInput = document.getElementById('rev_rcountry');
    const rCountry = countryCodeInput ? countryCodeInput.value.toUpperCase() : 'US';
    const rPhoneCountry = getDestinationPhoneCountryCode(rCountry);
    const rCCValue = countryCallingCodes[rPhoneCountry] || '1';

    // อัปเดตสไตล์ปุ่ม Sender
    if (senderCCState === 1) {
        senderCCBtn.innerText = "🇹🇭 Local (0)";
        senderCCBtn.className = "tel-toggle-btn";
    } else if (senderCCState === 2) {
        senderCCBtn.innerText = "🌍 Intl (+66)";
        senderCCBtn.className = "tel-toggle-btn active-blue";
    } else {
        senderCCBtn.innerText = "🏢 Intl (66)";
        senderCCBtn.className = "tel-toggle-btn active-green";
    }

    if (senderStyleState === 1) {
        senderStyleBtn.innerText = "📄 มีขีด/เว้นวรรค";
        senderStyleBtn.className = "tel-toggle-btn";
    } else {
        senderStyleBtn.innerText = "🔢 ตัวเลขล้วน";
        senderStyleBtn.className = "tel-toggle-btn active-green";
    }

    // อัปเดตสไตล์ปุ่ม Receiver
    if (receiverCCState === 1) {
        receiverCCBtn.innerText = `🌐 Local (0)`;
        receiverCCBtn.className = "tel-toggle-btn";
    } else if (receiverCCState === 2) {
        receiverCCBtn.innerText = `🌍 Intl (+${rCCValue})`;
        receiverCCBtn.className = "tel-toggle-btn active-blue";
    } else {
        receiverCCBtn.innerText = `🏢 Intl (${rCCValue})`;
        receiverCCBtn.className = "tel-toggle-btn active-green";
    }

    if (receiverStyleState === 1) {
        receiverStyleBtn.innerText = "📄 มีขีด/เว้นวรรค";
        receiverStyleBtn.className = "tel-toggle-btn";
    } else {
        receiverStyleBtn.innerText = "🔢 ตัวเลขล้วน";
        receiverStyleBtn.className = "tel-toggle-btn active-green";
    }

    // เขียนเบอร์ที่จัดรูปแบบแล้วกลับเข้าฟิลด์ Input
    document.getElementById('rev_stel').value = compilePhoneNumber(senderCoreTel, senderCCState, senderStyleState, 'TH');
    document.getElementById('rev_rtel').value = compilePhoneNumber(receiverCoreTel, receiverCCState, receiverStyleState, rPhoneCountry);

    // สร้างข้อมูลจ่าหน้าพัสดุรวมใหม่
    generateCombinedAddress();
}

// ==========================================
// 3. ระบบ Caching & History ประวัติการสแกน (chrome.storage.local)
// ==========================================
let historyDisplayLimit = 5;

async function saveToHistory(data) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['scanHistory'], (result) => {
            let history = result.scanHistory || [];
            const label = `${data.sender?.sname || 'ไม่ระบุชื่อ'} → ${data.receiver?.rname || 'ไม่ระบุชื่อ'}`;
            const newItem = { id: Date.now(), displayLabel: label, data: data };
            
            history.unshift(newItem);
            // เก็บประวัติได้ต่อเนื่องตามความสามารถของ chrome.storage (ตั้งเพดานความปลอดภัยไว้ที่ 100 รายการ)
            if (history.length > 100) history.pop();
            
            chrome.storage.local.set({ scanHistory: history }, () => {
                renderHistoryUI(); 
            });
        });
    }
}

function renderHistoryUI() {
    const container = document.getElementById('historyList');
    if (!container) return;

    chrome.storage.local.get(['scanHistory'], (result) => {
        const history = result.scanHistory || [];
        container.innerHTML = '';
        
        if (history.length === 0) {
            container.innerHTML = '<div style="color: #94a3b8; font-size: 11px; text-align: center; padding: 12px 0;">ยังไม่มีประวัติการสแกน</div>';
            return;
        }

        const visibleItems = history.slice(0, historyDisplayLimit);

        visibleItems.forEach(item => {
            const btn = document.createElement('button');
            btn.style.cssText = "width: 100%; text-align: left; padding: 8px 12px; margin-bottom: 6px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 1px rgba(0,0,0,0.02); transition: 0.15s;";
            btn.innerHTML = `<span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%; color: #334155; font-weight: 500;">${item.displayLabel}</span> <span style="color: #2563eb; font-size: 11px; font-weight: bold;">👁️ โหลด</span>`;
            
            btn.onmouseover = () => btn.style.background = "#eff6ff";
            btn.onmouseout = () => btn.style.background = "white";
            
            btn.onclick = () => {
                populateReviewForm(item.data);
                document.getElementById('inputSection').classList.add('hidden');
                document.getElementById('reviewSection').classList.add('active');
                document.getElementById('status').innerText = "โหลดข้อมูลย้อนหลังจากประวัติแล้ว";
                document.getElementById('status').className = "status-text info";
            };
            container.appendChild(btn);
        });

        // ควบคุมปุ่มแสดงเพิ่ม / ย่อรายการ เมื่อมีมากกว่า 5 รายการ
        if (history.length > 5) {
            const actionContainer = document.createElement('div');
            actionContainer.style.cssText = "display: flex; gap: 6px; margin-top: 6px;";

            if (historyDisplayLimit < history.length) {
                const moreBtn = document.createElement('button');
                const remaining = history.length - historyDisplayLimit;
                const nextBatch = Math.min(5, remaining);
                moreBtn.style.cssText = "flex: 1; padding: 6px 10px; background: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 6px; font-size: 11px; color: #475569; font-weight: bold; cursor: pointer; transition: 0.15s; text-align: center;";
                moreBtn.innerText = `⬇️ แสดงเพิ่ม (+${nextBatch} จากที่เหลือ ${remaining})`;
                moreBtn.onmouseover = () => moreBtn.style.background = "#e2e8f0";
                moreBtn.onmouseout = () => moreBtn.style.background = "#f1f5f9";
                moreBtn.onclick = () => {
                    historyDisplayLimit += 5;
                    renderHistoryUI();
                };
                actionContainer.appendChild(moreBtn);
            }

            if (historyDisplayLimit > 5) {
                const collapseBtn = document.createElement('button');
                collapseBtn.style.cssText = "padding: 6px 10px; background: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 6px; font-size: 11px; color: #64748b; font-weight: bold; cursor: pointer; transition: 0.15s; text-align: center;";
                collapseBtn.innerText = "⬆️ ย่อเหลือ 5";
                collapseBtn.onmouseover = () => collapseBtn.style.background = "#e2e8f0";
                collapseBtn.onmouseout = () => collapseBtn.style.background = "#f1f5f9";
                collapseBtn.onclick = () => {
                    historyDisplayLimit = 5;
                    renderHistoryUI();
                };
                actionContainer.appendChild(collapseBtn);
            }

            container.appendChild(actionContainer);
        }
    });
}

function saveReviewCache(data) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ 'lastAnalyzedData': data });
    }
}

function loadReviewCache() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['lastAnalyzedData'], (result) => {
            if (result && result.lastAnalyzedData) {
                populateReviewForm(result.lastAnalyzedData); 
                document.getElementById('inputSection').classList.add('hidden');
                document.getElementById('reviewSection').classList.add('active');
            }
        });
    }
}

function setupLiveCacheBackup() {
    const fields = [
        'rev_sname', 'rev_stel', 'rev_semail', 'rev_spremise', 'rev_ssubdistrict', 'rev_sdistrict', 'rev_sprovince', 'rev_spostalcode',
        'rev_rname', 'rev_rtel', 'rev_remail', 'rev_premise', 'rev_city', 'rev_state', 'rev_rpostcode', 'rev_rcountry'
    ];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                const currentData = {
                    sender: {
                        sname: document.getElementById('rev_sname').value,
                        stel: document.getElementById('rev_stel').value,
                        semail: document.getElementById('rev_semail').value,
                        spremise: document.getElementById('rev_spremise').value,
                        ssubdistrict: document.getElementById('rev_ssubdistrict').value,
                        sdistrict: document.getElementById('rev_sdistrict').value,
                        sprovince: document.getElementById('rev_sprovince').value,
                        spostalcode: document.getElementById('rev_spostalcode').value
                    },
                    receiver: {
                        rname: document.getElementById('rev_rname').value,
                        rtel: document.getElementById('rev_rtel').value,
                        remail: document.getElementById('rev_remail').value,
                        premise: document.getElementById('rev_premise').value,
                        city: document.getElementById('rev_city').value,
                        state: document.getElementById('rev_state').value,
                        rpostcode: document.getElementById('rev_rpostcode').value,
                        rcountry: document.getElementById('rev_rcountry').value 
                    }
                };
                
                // ถ้าระหว่างแก้ไข มีการแก้ไขเบอร์โทรศัพท์ ให้ถอดรหัสอัปเดตแกนหลักด้วยเพื่อรักษาตรรกะแปลงเบอร์
                if (id === 'rev_stel') {
                    senderCoreTel = extractCoreNumber(el.value, 'TH');
                } else if (id === 'rev_rtel') {
                    const country = document.getElementById('rev_rcountry').value;
                    receiverCoreTel = extractCoreNumber(el.value, country);
                }
                
                saveReviewCache(currentData);
            });
        }
    });
}

// ==========================================
// 4. ฟังก์ชัน Clipboard (Modern + Fallback)
// ==========================================
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        throw new Error("Clipboard API not supported");
    } catch (err) {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            return true;
        } catch (fallbackErr) {
            console.error('Final copy failure:', fallbackErr);
            return false;
        }
    }
}

// ==========================================
// 5. UI Theme & Initialization
// ==========================================
const updateSystemTheme = () => {
    const sys = document.getElementById('systemSelect').value;
    const sysCard = document.getElementById('systemCard');
    const toggleContainer = document.getElementById('toggleContainer');
    const optDpost = document.getElementById('opt-dpost');
    const optCnif = document.getElementById('opt-cnif');

    if (sys === 'CNIF') {
        sysCard.style.background = '#e0e7ff'; 
        sysCard.style.borderColor = '#818cf8';
        toggleContainer.classList.add('cnif-mode');
        optDpost.classList.remove('active');
        optCnif.classList.add('active');
    } else {
        sysCard.style.background = '#e0f2fe'; 
        sysCard.style.borderColor = '#7dd3fc';
        toggleContainer.classList.remove('cnif-mode');
        optDpost.classList.add('active');
        optCnif.classList.remove('active');
    }
};

if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['geminiApiKey', 'selectedModel', 'targetSystem'], (result) => {
        if (result.geminiApiKey) {
            document.getElementById('apiKey').value = result.geminiApiKey;
            fetchAvailableModels(result.geminiApiKey, result.selectedModel);
        }
        if (result.targetSystem) {
            document.getElementById('systemSelect').value = result.targetSystem;
        }
        updateSystemTheme();
    });
} else {
    updateSystemTheme();
}

document.getElementById('systemSelect').addEventListener('change', (e) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ targetSystem: e.target.value });
    }
    updateSystemTheme();
});

document.getElementById('opt-dpost').addEventListener('click', () => {
    const select = document.getElementById('systemSelect');
    if (select.value !== 'DPOST') { select.value = 'DPOST'; select.dispatchEvent(new Event('change')); }
});

document.getElementById('opt-cnif').addEventListener('click', () => {
    const select = document.getElementById('systemSelect');
    if (select.value !== 'CNIF') { select.value = 'CNIF'; select.dispatchEvent(new Event('change')); }
});

document.getElementById('opt-split').addEventListener('click', () => {
    if (currentIntakeMode === 'SPLIT') return;
    currentIntakeMode = 'SPLIT';
    document.getElementById('opt-split').classList.add('active');
    document.getElementById('opt-single').classList.remove('active');
    document.getElementById('intakeSlider').style.transform = 'translateX(0)';
    document.getElementById('splitModeZones').style.display = 'block';
    document.getElementById('singleModeZone').style.display = 'none';
    clearSingle(); 
});

document.getElementById('opt-single').addEventListener('click', () => {
    if (currentIntakeMode === 'SINGLE') return;
    currentIntakeMode = 'SINGLE';
    document.getElementById('opt-single').classList.add('active');
    document.getElementById('opt-split').classList.remove('active');
    document.getElementById('intakeSlider').style.transform = 'translateX(100%)';
    document.getElementById('splitModeZones').style.display = 'none';
    document.getElementById('singleModeZone').style.display = 'block';
    clearSender(); clearReceiver(); 
});

async function fetchAvailableModels(key, savedModel) {
    const select = document.getElementById('modelSelect');
    const statusDot = document.getElementById('modelStatus');
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (!response.ok) throw new Error("API Key Invalid");
        const data = await response.json();
        const models = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
        
        select.innerHTML = '';
        models.forEach(model => {
            const opt = document.createElement('option');
            opt.value = model.name;
            opt.innerText = model.displayName || model.name.split('/')[1];
            if (model.name === savedModel) opt.selected = true;
            select.appendChild(opt);
        });
        statusDot.className = 'status-dot online';
    } catch (err) {
        select.innerHTML = '<option value="">Check API Key</option>';
        statusDot.className = 'status-dot offline';
    }
}

document.getElementById('apiKey').addEventListener('input', (e) => {
    const key = e.target.value.trim();
    if (key) {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ geminiApiKey: key });
        }
        fetchAvailableModels(key);
    }
});

document.getElementById('modelSelect').addEventListener('change', (e) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ selectedModel: e.target.value });
    }
});

document.getElementById('refreshModels').addEventListener('click', () => {
    const key = document.getElementById('apiKey').value.trim();
    if (key) fetchAvailableModels(key);
});

// ==========================================
// 6. FEATURE: DRAG & DROP + CANVAS RESIZING
// ==========================================
const processImageFile = (file, inputId, previewId) => {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1024;
                const MAX_HEIGHT = 1024;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

                if (inputId === 'senderInput') senderImageData = compressedBase64.split(',')[1];
                else if (inputId === 'receiverInput') receiverImageData = compressedBase64.split(',')[1];
                else singleImageData = compressedBase64.split(',')[1]; 
                
                const previewDiv = document.getElementById(previewId);
                previewDiv.innerHTML = ''; 

                const wrapper = document.createElement('div');
                wrapper.style.position = 'relative';
                wrapper.style.display = 'inline-block';

                const previewImg = document.createElement('img');
                previewImg.src = compressedBase64;
                previewImg.className = 'preview-img';

                const delBtn = document.createElement('button');
                delBtn.innerText = '❌';
                delBtn.style.position = 'absolute';
                delBtn.style.top = '-8px';
                delBtn.style.right = '-8px';
                delBtn.style.background = 'white';
                delBtn.style.border = '1px solid #e2e8f0';
                delBtn.style.borderRadius = '50%';
                delBtn.style.cursor = 'pointer';
                delBtn.style.fontSize = '10px';
                delBtn.style.padding = '4px';
                delBtn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';

                delBtn.addEventListener('click', () => {
                    if (inputId === 'senderInput') senderImageData = null;
                    else if (inputId === 'receiverInput') receiverImageData = null;
                    else singleImageData = null;
                    previewDiv.innerHTML = '';
                    previewDiv.classList.remove('active');
                    const input = document.getElementById(inputId);
                    input.value = input.value.replace(/\[แนบรูปภาพแล้ว.*?\]/g, '').trim();
                });

                wrapper.appendChild(previewImg);
                wrapper.appendChild(delBtn);
                previewDiv.appendChild(wrapper);
                previewDiv.classList.add('active');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
};

const setupDragAndDrop = (zoneId, inputId, previewId) => {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);

    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', (e) => { e.preventDefault(); zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            processImageFile(file, inputId, previewId);
            input.value = input.value + (input.value ? '\n' : '') + `[แนบรูปภาพแล้ว: ${file.name}]`;
        } else {
            const textData = e.dataTransfer.getData('text/plain');
            if (textData) input.value = input.value + (input.value ? '\n' : '') + textData;
        }
    });

    input.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile();
                processImageFile(file, inputId, previewId);
                input.value = input.value + (input.value ? '\n' : '') + `[แนบรูปภาพแล้ว]`;
            }
        }
    });
};

setupDragAndDrop('senderZone', 'senderInput', 'senderPreview');
setupDragAndDrop('receiverZone', 'receiverInput', 'receiverPreview');
setupDragAndDrop('singleZone', 'singleInput', 'singlePreview'); 

const clearSender = () => { document.getElementById('senderInput').value = ''; senderImageData = null; const preview = document.getElementById('senderPreview'); preview.innerHTML = ''; preview.classList.remove('active'); };
const clearReceiver = () => { document.getElementById('receiverInput').value = ''; receiverImageData = null; const preview = document.getElementById('receiverPreview'); preview.innerHTML = ''; preview.classList.remove('active'); };
const clearSingle = () => { document.getElementById('singleInput').value = ''; singleImageData = null; const preview = document.getElementById('singlePreview'); preview.innerHTML = ''; preview.classList.remove('active'); };

document.getElementById('clearSenderBtn').addEventListener('click', clearSender);
document.getElementById('clearReceiverBtn').addEventListener('click', clearReceiver);
document.getElementById('clearSingleBtn').addEventListener('click', clearSingle);

document.getElementById('clearAllBtn').addEventListener('click', () => {
    clearSender(); clearReceiver(); clearSingle();
    const status = document.getElementById('status');
    status.innerText = "ล้างข้อมูลเรียบร้อย พร้อมรับงานใหม่!";
    status.className = "status-text";
});

// ==========================================
// 7. FEATURE: AI EXTRACTION (วิเคราะห์ข้อมูล)
// ==========================================
document.getElementById('processBtn').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    const model = document.getElementById('modelSelect').value;
    const status = document.getElementById('status');
    const senderText = document.getElementById('senderInput').value.trim();
    const receiverText = document.getElementById('receiverInput').value.trim();
    const singleText = document.getElementById('singleInput').value.trim();
    const targetSystem = document.getElementById('systemSelect').value;

    if (!apiKey || !model) { status.innerText = "กรุณาเช็ค API Key"; status.className = "status-text error"; return; }

    if (currentIntakeMode === 'SPLIT' && (!senderText && !senderImageData || !receiverText && !receiverImageData)) {
        status.innerText = "⚠️ กรุณาใส่ข้อมูลให้ครบทั้งผู้ส่งและผู้รับ";
        status.className = "status-text error"; return; 
    } else if (currentIntakeMode === 'SINGLE' && !singleText && !singleImageData) {
        status.innerText = "⚠️ กรุณาใส่รูปหรือข้อความในกล่องสแกนรวม";
        status.className = "status-text error"; return; 
    }

    status.innerText = "Gemini กำลังวิเคราะห์ข้อมูล...";
    status.className = "status-text info";

    try {
        const promptText = `Task: Extract shipping info for International post from Thailand. Translate ALL info to English. 
        CRITICAL RULES:
        1. Sender (Thailand): Identify Sub-district, District, Province, Postcode.
        2. Receiver (Intl): Identify City, State, Postcode.
        3. ADDRESS/PREMISE RULE (CRITICAL): Combine all house numbers, building, village, Soi, Yaek, Road/Street, AND Suburbs into the single 'premise' (Receiver) or 'spremise' (Sender) field. DO NOT DROP ANY INFO.
        4. MISSING DATA: If Postcode missing, infer it. If State missing, leave EMPTY "".
        5. ITMATT/ePacket US DESTINATION RULE: For the 13 special destinations, return the specific destination name/code, not mainland USA: Alaska, American Samoa, Federated States of Micronesia, Guam, Guantanamo Bay, Hawaii, Marianas, Marshall Islands, Northern Mariana Islands, Palau, Puerto Rico, Virgin Islands (U.S.A.), Wake Islands. For the 48 mainland states only, return US / United States of America (USA).
        Return ONLY valid JSON:
        {
          "sender": { "sname":"", "stel":"", "semail":"", "spremise":"", "sstreet":"", "ssubdistrict":"", "sdistrict":"", "sprovince":"", "spostalcode":"" },
          "receiver": { "rname":"", "rtel":"", "remail":"", "premise":"", "city":"", "state":"", "rpostcode":"", "rcountry":"" }
        }`;

        let parts = [{ text: promptText }];
        
        if (currentIntakeMode === 'SPLIT') {
            parts.push({ text: `Sender Text: ${senderText}` });
            if (senderImageData) parts.push({ inlineData: { mimeType: "image/jpeg", data: senderImageData } });
            parts.push({ text: `Receiver Text: ${receiverText}` });
            if (receiverImageData) parts.push({ inlineData: { mimeType: "image/jpeg", data: receiverImageData } });
        } else {
            parts.push({ text: `Analyze BOTH sender and receiver. Text: ${singleText}` });
            if (singleImageData) parts.push({ inlineData: { mimeType: "image/jpeg", data: singleImageData } });
        }

        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts: parts }],
                generationConfig: { responseMimeType: "application/json" } // บังคับคืนค่า JSON ป้องกัน Error
            })
        });

        const json = await resp.json();
        if (json.error) throw new Error(json.error.message);
        
        const responseText = json.candidates[0].content.parts[0].text;
        
        let cleanData;
        try {
            const cleanText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
            cleanData = JSON.parse(cleanText);
        } catch (parseErr) {
            throw new Error("AI ส่งข้อมูลผิดพลาด กรุณากดวิเคราะห์ใหม่อีกครั้งครับ");
        }

        if (currentIntakeMode === 'SPLIT') {
            document.getElementById('origSenderContainer').style.display = 'flex';
            document.getElementById('origSenderBox').style.display = 'block';
            document.getElementById('origReceiverContainer').style.display = 'flex';
            document.getElementById('origReceiverBox').style.display = 'block';
            document.getElementById('origSingleContainer').style.display = 'none';

            const safeSenderText = senderText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            document.getElementById('origSenderBox').innerHTML = `<div>${safeSenderText.replace(/\n/g, '<br>')}</div>` + (senderImageData ? `<img src="data:image/jpeg;base64,${senderImageData}" style="max-height:60px; margin-top:6px; border-radius:4px; border:1px solid #ccc;">` : '');
            document.getElementById('toggleOrigSender').innerText = '👁️ ซ่อนต้นฉบับ'; 

            const safeReceiverText = receiverText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            document.getElementById('origReceiverBox').innerHTML = `<div>${safeReceiverText.replace(/\n/g, '<br>')}</div>` + (receiverImageData ? `<img src="data:image/jpeg;base64,${receiverImageData}" style="max-height:60px; margin-top:6px; border-radius:4px; border:1px solid #ccc;">` : '');
            document.getElementById('toggleOrigReceiver').innerText = '👁️ ซ่อนต้นฉบับ'; 
        } else {
            document.getElementById('origSenderContainer').style.display = 'none';
            document.getElementById('origSenderBox').style.display = 'none';
            document.getElementById('origReceiverContainer').style.display = 'none';
            document.getElementById('origReceiverBox').style.display = 'none';
            document.getElementById('origSingleContainer').style.display = 'block';

            const safeSingleText = singleText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const origSingleBox = document.getElementById('origSingleBox');
            origSingleBox.innerHTML = `<div>${safeSingleText.replace(/\n/g, '<br>')}</div>` + (singleImageData ? `<img src="data:image/jpeg;base64,${singleImageData}" style="max-height:60px; margin-top:6px; border-radius:4px; border:1px solid #ccc;">` : '');
            origSingleBox.style.display = 'block';
            document.getElementById('toggleOrigSingle').innerText = '👁️ ซ่อนต้นฉบับ';
        }

        populateReviewForm(cleanData);
        saveToHistory(cleanData);

        document.getElementById('inputSection').classList.add('hidden');
        document.getElementById('reviewSection').classList.add('active');
        
        status.innerText = `วิเคราะห์เสร็จสิ้น! กรุณาตรวจสอบข้อมูลก่อนส่งเข้า ${targetSystem}`;
        status.className = "status-text info";

    } catch (err) {
        status.innerText = "Error: " + err.message;
        status.className = "status-text error";
    }
});

// ==========================================
// 8. FORM POPULATION & ADDRESS COMBINE
// ==========================================
function generateCombinedAddress() {
    const sName = document.getElementById('rev_sname').value.trim();
    const sTel = document.getElementById('rev_stel').value.trim();
    const sEmail = document.getElementById('rev_semail').value.trim();
    const sPremise = document.getElementById('rev_spremise').value.trim();
    const sSub = document.getElementById('rev_ssubdistrict').value.trim();
    const sDist = document.getElementById('rev_sdistrict').value.trim();
    const sProv = document.getElementById('rev_sprovince').value.trim();
    const sPost = document.getElementById('rev_spostalcode').value.trim();

    const rName = document.getElementById('rev_rname').value.trim();
    const rTel = document.getElementById('rev_rtel').value.trim();
    const rEmail = document.getElementById('rev_remail').value.trim();
    const rPremise = document.getElementById('rev_premise').value.trim();
    const rCity = document.getElementById('rev_city').value.trim();
    const rState = document.getElementById('rev_state').value.trim();
    const rPost = document.getElementById('rev_rpostcode').value.trim();
    const rCountry = document.getElementById('rev_rcountry').value.trim();

    let text = "[FROM / ผู้ส่ง]\n";
    if (sName) text += sName + "\n";
    if (sTel) text += "Tel: " + sTel + "\n";
    if (sEmail) text += "Email: " + sEmail + "\n";
    if (sPremise) text += sPremise + "\n";
    let sLoc = [sSub, sDist].filter(Boolean).join(", ");
    if (sLoc) text += sLoc + "\n";
    let sProvPost = [sProv, sPost].filter(Boolean).join(" ");
    if (sProvPost) text += sProvPost + "\n";
    text += "THAILAND\n\n";

    text += "[TO / ผู้รับ]\n";
    if (rName) text += rName + "\n";
    if (rTel) text += "Tel: " + rTel + "\n";
    if (rEmail) text += "Email: " + rEmail + "\n";
    if (rPremise) text += rPremise + "\n";
    let rLoc = [rCity, rState].filter(Boolean).join(", ");
    if (rLoc) text += rLoc + "\n";
    if (rPost) text += rPost + "\n";
    if (rCountry) text += getDestinationLabelName(rCountry) + "\n";

    document.getElementById('combinedAddress').value = text;
}

document.querySelectorAll('.review-field input').forEach(input => {
    input.addEventListener('input', generateCombinedAddress);
});

function validateLabelData(data) {
    const errors = [];
    const warnings = [];
    const { sender, receiver } = data;

    if (!receiver.rName) errors.push('กรุณาระบุชื่อผู้รับ');
    if (!receiver.rPremise) errors.push('กรุณาระบุที่อยู่ผู้รับ');
    if (!receiver.rPost) errors.push('กรุณาระบุ Postcode/ZIP Code ปลายทาง');
    if (!receiver.rCountry) errors.push('กรุณาระบุปลายทาง/ประเทศปลายทาง');

    if (receiver.rCountry && isUsRelatedDestinationInput(receiver.rCountry) && !resolveItmattDestination(receiver.rCountry)) {
        warnings.push('ปลายทางสหรัฐฯ/พื้นที่พิเศษไม่ตรงกับ rule ITMATT/ePacket กรุณาเลือก USA mainland หรือชื่อปลายทางพิเศษให้ถูกต้อง');
    }

    if (!receiver.rTel) warnings.push('ยังไม่มีเบอร์โทรผู้รับ');
    if (!sender.sName || !sender.sPremise || !sender.sPost) warnings.push('ข้อมูลผู้ส่งยังไม่ครบ อาจทำให้ return address ไม่ชัดเจน');

    const receiverText = [
        receiver.rName,
        receiver.rTel,
        receiver.rPremise,
        receiver.rCity,
        receiver.rState,
        receiver.rPost,
        receiver.rCountry
    ].filter(Boolean).join(' ');

    if (receiverText.length > 190) {
        warnings.push('ข้อมูลผู้รับค่อนข้างยาว อาจล้นพื้นที่ฉลาก 10x10 กรุณาตรวจ preview ก่อนพิมพ์จริง');
    }

    return { ok: errors.length === 0, errors, warnings };
}

function runLabelValidationBeforeOutput(data, outputType) {
    const result = validateLabelData(data);
    const status = document.getElementById('status');

    if (!result.ok) {
        const message = 'ยังพิมพ์/คัดลอกไม่ได้:\n- ' + result.errors.join('\n- ');
        status.innerText = result.errors.join(' / ');
        status.className = 'status-text error';
        alert(message);
        return false;
    }

    if (result.warnings.length > 0) {
        const label = outputType === 'print' ? 'พิมพ์' : 'คัดลอก';
        const message = `ตรวจพบข้อควรระวังก่อน${label}:\n- ${result.warnings.join('\n- ')}\n\nต้องการทำต่อหรือไม่?`;
        if (!confirm(message)) {
            status.innerText = 'ยกเลิก output เพื่อตรวจข้อมูลก่อน';
            status.className = 'status-text info';
            return false;
        }
    }

    return true;
}

document.getElementById('copyAddressBtn').addEventListener('click', async (e) => {
    const data = getLabelData();
    if (!runLabelValidationBeforeOutput(data, 'copy')) return;

    const addressText = document.getElementById('combinedAddress').value;
    const btn = e.target;
    const success = await copyToClipboard(addressText);
    
    if (success) {
        const originalText = btn.innerText;
        btn.innerText = "✅ คัดลอกแล้ว!";
        btn.style.borderColor = "#22c55e";
        btn.style.background = "#dcfce7";
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.borderColor = "#cbd5e1";
            btn.style.background = "white";
        }, 2000);
    } else {
        alert("ไม่สามารถคัดลอกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
});

function populateReviewForm(data) {
    if (data.sender) {
        document.getElementById('rev_sname').value = data.sender.sname || '';
        document.getElementById('rev_semail').value = data.sender.semail || '';
        document.getElementById('rev_spremise').value = data.sender.spremise || '';
        document.getElementById('rev_ssubdistrict').value = data.sender.ssubdistrict || '';
        document.getElementById('rev_sdistrict').value = data.sender.sdistrict || '';
        document.getElementById('rev_sprovince').value = data.sender.sprovince || '';
        document.getElementById('rev_spostalcode').value = data.sender.spostalcode || '';
        
        // ถอดรหัสหาสายตัวเลขแกนหลักดั้งเดิมของผู้ส่ง (ประเทศไทย TH)
        originalSenderTel = data.sender.stel || '';
        senderCoreTel = extractCoreNumber(originalSenderTel, 'TH');
        senderCCState = 1;      // เริ่มต้นที่ Local (0)
        senderStyleState = 1;   // เริ่มต้นที่ Formatted (มีขีด)
    }
    if (data.receiver) {
        document.getElementById('rev_rname').value = data.receiver.rname || '';
        document.getElementById('rev_remail').value = data.receiver.remail || '';
        document.getElementById('rev_premise').value = data.receiver.premise || '';
        document.getElementById('rev_city').value = data.receiver.city || '';
        document.getElementById('rev_state').value = data.receiver.state || '';
        document.getElementById('rev_rpostcode').value = data.receiver.rpostcode || '';
        
        const rCountryCode = (data.receiver.rcountry || '').toUpperCase();
        document.getElementById('rev_rcountry').value = rCountryCode; 

        // ถอดรหัสหาสายตัวเลขแกนหลักดั้งเดิมของผู้รับ
        originalReceiverTel = data.receiver.rtel || '';
        receiverCoreTel = extractCoreNumber(originalReceiverTel, getDestinationPhoneCountryCode(rCountryCode));
        receiverCCState = 1;    // เริ่มต้นที่ Local (0)
        receiverStyleState = 1; // เริ่มต้นที่ Formatted (มีขีด)

        const itmattDestination = resolveItmattDestination(rCountryCode);
        const warningBox = document.getElementById('territoryWarning');
        if (itmattDestination && itmattDestination.key !== 'US') {
            document.getElementById('warn_code').innerText = itmattDestination.labelName;
            warningBox.style.display = 'block';
        } else {
            warningBox.style.display = 'none';
        }
    }
    
    // บังคับประมวลผลจัดฟอร์แมตเบอร์โทรและเขียนลง UI
    applyPhoneFormatting();
    saveReviewCache(data); 
}

// ==========================================
// 9. EVENT LISTENERS: TOGGLE PHONE FORMATS (แนวทางที่ 2)
// ==========================================

// 9.1 ผู้ส่ง - สลับรหัสประเทศ (CC: Local -> +66 -> 66)
document.getElementById('btnSenderCC').addEventListener('click', () => {
    senderCCState = senderCCState >= 3 ? 1 : senderCCState + 1;
    applyPhoneFormatting();
});

// 9.2 ผู้ส่ง - สลับรูปแบบ (สัญลักษณ์มีขีด vs ตัวเลขล้วน)
document.getElementById('btnSenderSymbol').addEventListener('click', () => {
    senderStyleState = senderStyleState === 1 ? 2 : 1;
    applyPhoneFormatting();
});

// 9.3 ผู้รับ - สลับรหัสประเทศ (CC: Local -> +รหัส -> รหัสไม่มีบวก)
document.getElementById('btnReceiverCC').addEventListener('click', () => {
    receiverCCState = receiverCCState >= 3 ? 1 : receiverCCState + 1;
    applyPhoneFormatting();
});

// 9.4 ผู้รับ - สลับรูปแบบ (สัญลักษณ์มีขีด vs ตัวเลขล้วน)
document.getElementById('btnReceiverSymbol').addEventListener('click', () => {
    receiverStyleState = receiverStyleState === 1 ? 2 : 1;
    applyPhoneFormatting();
});

// จัดการเมื่อพนักงานเปลี่ยนข้อมูลรหัสประเทศปลายทางในช่อง ISO (เพื่อให้ปุ่ม CC ของฝั่งผู้รับอัปเดตรหัสนานาชาติแบบเรียลไทม์)
document.getElementById('rev_rcountry').addEventListener('input', (e) => {
    const val = e.target.value.toUpperCase();
    if (val.length >= 2) {
        // ถอดรหัสแกนหลักใหม่ตามรหัสประเทศที่อัปเดต
        const currentInputPhone = document.getElementById('rev_rtel').value;
        receiverCoreTel = extractCoreNumber(currentInputPhone, getDestinationPhoneCountryCode(val));
        applyPhoneFormatting();
    }
});

// ==========================================
// 10. TOGGLE VIEW & CANCEL BUTTON
// ==========================================
document.getElementById('toggleOrigSender').addEventListener('click', (e) => {
    const box = document.getElementById('origSenderBox');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
    e.target.innerText = box.style.display === 'none' ? '👁️ ดูต้นฉบับ' : '👁️ ซ่อนต้นฉบับ';
});

document.getElementById('toggleOrigReceiver').addEventListener('click', (e) => {
    const box = document.getElementById('origReceiverBox');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
    e.target.innerText = box.style.display === 'none' ? '👁️ ดูต้นฉบับ' : '👁️ ซ่อนต้นฉบับ';
});

document.getElementById('toggleOrigSingle').addEventListener('click', (e) => {
    const box = document.getElementById('origSingleBox');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
    e.target.innerText = box.style.display === 'none' ? '👁️ ดูต้นฉบับ' : '👁️ ซ่อนต้นฉบับ';
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove('lastAnalyzedData');
    }
    document.getElementById('inputSection').classList.remove('hidden');
    document.getElementById('reviewSection').classList.remove('active');
    
    clearSender(); 
    clearReceiver(); 
    clearSingle(); 
    
    const status = document.getElementById('status');
    status.innerText = "ย้อนกลับ/เคลียร์ข้อมูลแล้ว พร้อมรับงานใหม่!";
    status.className = "status-text";
});

// ==========================================
// 11. INJECT ข้อมูลเข้าเว็บเป้าหมาย
// ==========================================
document.getElementById('confirmBtn').addEventListener('click', async () => {
    const status = document.getElementById('status');
    const targetSystem = document.getElementById('systemSelect').value;
    const conf = siteConfigs[targetSystem]; 

    status.innerText = `กำลังฉีดข้อมูลลงหน้าเว็บ ${targetSystem}...`;
    status.className = "status-text info";

    const finalData = {
        sender: {
            sname: document.getElementById('rev_sname').value,
            stel: document.getElementById('rev_stel').value,
            semail: document.getElementById('rev_semail').value,
            spremise: document.getElementById('rev_spremise').value,
            ssubdistrict: document.getElementById('rev_ssubdistrict').value,
            sdistrict: document.getElementById('rev_sdistrict').value,
            sprovince: document.getElementById('rev_sprovince').value,
            spostalcode: document.getElementById('rev_spostalcode').value
        },
        receiver: {
            rname: document.getElementById('rev_rname').value,
            rtel: document.getElementById('rev_rtel').value,
            remail: document.getElementById('rev_remail').value,
            premise: document.getElementById('rev_premise').value,
            city: document.getElementById('rev_city').value,
            state: document.getElementById('rev_state').value,
            rpostcode: document.getElementById('rev_rpostcode').value,
            rcountry: document.getElementById('rev_rcountry').value 
        }
    };

    try {
        if (typeof chrome === 'undefined' || !chrome.tabs) {
            throw new Error("ฟังก์ชันนี้ทำงานได้เฉพาะเมื่อติดตั้งเป็น Chrome Extension เท่านั้นครับ");
        }

        const allTargetTabs = await chrome.tabs.query({ url: `*://${conf.urlDomain}/*` });
        if (allTargetTabs.length === 0) throw new Error(`หาหน้าเว็บ ${targetSystem} ไม่เจอ (เผลอปิดไปหรือเปล่าครับ?)`);
        
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const targetTab = (activeTab && activeTab.url && activeTab.url.includes(conf.urlDomain)) ? activeTab : allTargetTabs[0];
        
        if (targetTab.url.toLowerCase().includes("login")) {
            status.innerText = `⚠️ กรุณา Login เข้าระบบ ${targetSystem} ก่อนนะครับ`;
            status.className = "status-text error";
            return;
        }

        if (!conf.validPaths.some(path => targetTab.url.toLowerCase().includes(path.toLowerCase()))) {
            status.innerText = conf.wrongPathMsg;
            status.className = "status-text error";
            return;
        }

        const injectionResult = await chrome.scripting.executeScript({
            target: { tabId: targetTab.id },
            func: (data, config) => {
                if (config.urlDomain.includes("cnif")) {
                    const checkField = document.getElementById(config.fields.sname);
                    if (checkField && checkField.disabled) return { status: "LOCKED_BARCODE" }; 
                }

                let filledCount = 0;
                let countryFailure = null;
                const setValue = (id, value) => {
                    const el = document.getElementById(id);
                    if (el && value) {
                        el.focus(); el.value = value;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                        el.blur(); filledCount++;
                    }
                };

                if (data.receiver) {
                    setValue(config.fields.rname, data.receiver.rname);
                    setValue(config.fields.rtel, data.receiver.rtel);
                    setValue(config.fields.remail, data.receiver.remail);
                    setValue(config.fields.premise, data.receiver.premise);
                    setValue(config.fields.city, data.receiver.city);
                    setValue(config.fields.state, data.receiver.state);
                    setValue(config.fields.rpostcode, data.receiver.rpostcode);

                    if (data.receiver.rcountry) {
                        let rCode = data.receiver.rcountry.toUpperCase();
                        const normalizeDestinationText = (value) => String(value || '')
                            .toUpperCase()
                            .replace(/[.()]/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
                        const itmattDestinations = [
                            { key: 'US', selectionNames: ['UNITED STATES OF AMERICA', 'UNITED STATES', 'USA'], aliases: ['US', 'USA', 'UNITED STATES', 'UNITED STATES OF AMERICA', 'MAINLAND USA', 'US MAINLAND'] },
                            { key: 'AK', selectionNames: ['ALASKA'], aliases: ['AK', 'ALASKA'] },
                            { key: 'AS', selectionNames: ['AMERICAN SAMOA'], aliases: ['AS', 'AMERICAN SAMOA'] },
                            { key: 'FM', selectionNames: ['FEDERATED STATES OF MICRONESIA', 'MICRONESIA'], aliases: ['FM', 'MICRONESIA', 'FEDERATED STATES OF MICRONESIA'] },
                            { key: 'GU', selectionNames: ['GUAM'], aliases: ['GU', 'GUAM'] },
                            { key: 'GTMO', selectionNames: ['GUANTANAMO BAY'], aliases: ['GTMO', 'GUANTANAMO', 'GUANTANAMO BAY'] },
                            { key: 'HI', selectionNames: ['HAWAII'], aliases: ['HI', 'HAWAII'] },
                            { key: 'MARIANAS', selectionNames: ['MARIANAS'], aliases: ['MARIANAS', 'MARIANA ISLANDS'] },
                            { key: 'MH', selectionNames: ['MARSHALL ISLANDS'], aliases: ['MH', 'MARSHALL ISLANDS'] },
                            { key: 'MP', selectionNames: ['NORTHERN MARIANA ISLANDS', 'NORTHERN MARIANAS'], aliases: ['MP', 'NORTHERN MARIANA ISLANDS', 'NORTHERN MARIANAS'] },
                            { key: 'PW', selectionNames: ['PALAU'], aliases: ['PW', 'PALAU'] },
                            { key: 'PR', selectionNames: ['PUERTO RICO'], aliases: ['PR', 'PUERTO RICO'] },
                            { key: 'VI', selectionNames: ['VIRGIN ISLANDS', 'VIRGIN ISLANDS U S A', 'U S VIRGIN ISLANDS'], aliases: ['VI', 'VIRGIN ISLANDS', 'VIRGIN ISLANDS U S A', 'US VIRGIN ISLANDS', 'U S VIRGIN ISLANDS'] },
                            { key: 'WAKE', selectionNames: ['WAKE ISLANDS', 'WAKE ISLAND'], aliases: ['WAKE', 'WAKE ISLAND', 'WAKE ISLANDS'] }
                        ];
                        const resolveItmattDestination = (value) => {
                            const normalized = normalizeDestinationText(value);
                            return itmattDestinations.find(destination => {
                                const candidates = [destination.key, ...destination.selectionNames, ...destination.aliases];
                                return candidates.some(candidate => normalizeDestinationText(candidate) === normalized);
                            }) || null;
                        };
                        const destination = resolveItmattDestination(rCode);
                        const selectionTerms = destination
                            ? [...new Set([destination.key, ...destination.selectionNames, ...destination.aliases].filter(Boolean).map(term => String(term).toUpperCase()))]
                            : [rCode];

                        function findDpostCountryOption(options, destinationKey, terms) {
                            const normalizeOptionText = (value) => String(value || '')
                                .toUpperCase()
                                .replace(/[^A-Z0-9]+/g, ' ')
                                .replace(/\s+/g, ' ')
                                .trim();
                            const specialTargets = {
                                US: { code: 'US', name: 'UNITED STATES OF AMERICA' },
                                AK: { code: 'AK', name: 'US ALASKA' },
                                AS: { code: 'AS', name: 'US AMERICAN SAMOA US SAMOA' },
                                FM: { code: 'FM', name: 'US FEDRATED STATES OF MICRONESIA' },
                                GU: { code: 'GU', name: 'US GUAM' },
                                GTMO: { code: 'GZ', name: 'US GUANTANAMO BAY' },
                                HI: { code: 'HI', name: 'US HAWAII' },
                                MARIANAS: { code: 'MP', name: 'US MARINAS' },
                                MH: { code: 'MH', name: 'US MARSHALL ISLANDS' },
                                MP: { code: 'MP', name: 'US NORTHERN MARIANA ISLAND' },
                                PW: { code: 'PW', name: 'US PALAU' },
                                PR: { code: 'PR', name: 'US PUERTO RICO' },
                                VI: { code: 'VI', name: 'US VIRGIN ISLAND' },
                                WAKE: { code: 'WK', name: 'US WAKE ISLAND' }
                            };
                            const parsedOptions = options.map(option => {
                                const text = String(option.text || '').trim();
                                const codeMatch = text.toUpperCase().match(/\(([A-Z]{2})\)\s*$/);
                                if (!codeMatch) return null;
                                return {
                                    option,
                                    code: codeMatch[1],
                                    name: normalizeOptionText(text.slice(0, codeMatch.index)),
                                    fullText: normalizeOptionText(text)
                                };
                            }).filter(Boolean);

                            const specialTarget = specialTargets[String(destinationKey || '').toUpperCase()];
                            if (specialTarget) {
                                const targetName = normalizeOptionText(specialTarget.name);
                                const exactSpecial = parsedOptions.find(option =>
                                    option.code === specialTarget.code && option.name === targetName
                                );
                                return exactSpecial ? exactSpecial.option : null;
                            }

                            const normalizedTerms = [...new Set((terms || [])
                                .map(normalizeOptionText)
                                .filter(Boolean))];
                            const exactMatches = parsedOptions.filter(option => normalizedTerms.some(term =>
                                term === option.code || term === option.name || term === option.fullText
                            ));
                            return exactMatches.length === 1 ? exactMatches[0].option : null;
                        }
                        
                        if (config.countryBehavior === 'SEARCH_IN_OPTIONS') {
                            const countrySelect = document.getElementById('adsId'); 
                            if (countrySelect) {
                                const optionData = Array.from(countrySelect.options).map(option => ({
                                    text: option.text,
                                    value: option.value
                                }));
                                const matchedOption = findDpostCountryOption(
                                    optionData,
                                    destination ? destination.key : null,
                                    selectionTerms
                                );
                                if (!matchedOption) {
                                    countryFailure = { status: 'COUNTRY_NOT_FOUND', requested: rCode };
                                } else {
                                    countrySelect.value = matchedOption.value;
                                    countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
                                    const selectedText = countrySelect.options[countrySelect.selectedIndex]?.text || '';
                                    if (normalizeDestinationText(selectedText) !== normalizeDestinationText(matchedOption.text)) {
                                        countryFailure = { status: 'COUNTRY_MISMATCH', requested: rCode };
                                    } else {
                                        filledCount++;
                                    }
                                }
                            } else {
                                countryFailure = { status: 'COUNTRY_NOT_FOUND', requested: rCode };
                            }
                        } else if (config.countryBehavior === 'DIRECT_NG_MODEL') {
                            const countrySelect = document.querySelector('select[ng-model="item.addressee_post_adr_country_cd"]');
                            if (countrySelect) {
                                let targetValue = null;
                                for (let i = 0; i < countrySelect.options.length; i++) {
                                    const optText = countrySelect.options[i].text.toUpperCase();
                                    const normalizedOptText = normalizeDestinationText(optText);
                                    const matched = selectionTerms.some(term => {
                                        const normalizedTerm = normalizeDestinationText(term);
                                        return countrySelect.options[i].value.toUpperCase() === term ||
                                            optText.includes(`(${term})`) ||
                                            normalizedOptText.includes(normalizedTerm);
                                    });
                                    if (matched) {
                                        targetValue = countrySelect.options[i].value;
                                        break;
                                    }
                                }
                                countrySelect.value = targetValue || (destination ? destination.key : rCode); 
                                countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
                                filledCount++;
                            }
                        }
                    }
                }

                if (data.sender) {
                    setValue(config.fields.sname, data.sender.sname);
                    setValue(config.fields.stel, data.sender.stel);
                    setValue(config.fields.semail, data.sender.semail);
                    setValue(config.fields.spremise, data.sender.spremise);
                    setValue(config.fields.ssubdistrict, data.sender.ssubdistrict); 
                    setValue(config.fields.sdistrict, data.sender.sdistrict);       
                    setValue(config.fields.sprovince, data.sender.sprovince);
                    setValue(config.fields.spostalcode, data.sender.spostalcode);
                }
                if (countryFailure) return { ...countryFailure, count: filledCount };
                return { status: "SUCCESS", count: filledCount };
            },
            args: [finalData, conf] 
        });

        const resultObj = injectionResult[0].result;
        
        if (resultObj.status === "LOCKED_BARCODE") {
            status.innerText = "⚠️ ฟอร์มถูกล็อกอยู่! กรุณากรอก Barcode และกด Search ที่หน้าเว็บให้เรียบร้อยก่อนครับ";
            status.className = "status-text error";
            return; 
        }

        if (resultObj.status === "COUNTRY_NOT_FOUND" || resultObj.status === "COUNTRY_MISMATCH") {
            status.innerText = `⚠️ ไม่สามารถเลือกประเทศปลายทาง ${resultObj.requested || ''} ใน DPOST ได้อย่างปลอดภัย กรุณาตรวจสอบประเทศในหน้าตรวจสอบข้อมูลและรายการประเทศบนเว็บไซต์`;
            status.className = "status-text error";
            return;
        }

        const filledElements = resultObj.count;
        if (filledElements === 0) throw new Error("หาช่องฟอร์มไม่เจอ โปรดรีเฟรชหน้าเว็บ 1 ครั้งครับ");

        status.innerText = `✅ สำเร็จ! กรอกเข้า ${targetSystem} ไป ${filledElements} ช่องเรียบร้อย (กด ย้อนกลับ เพื่อเริ่มงานใหม่)`;
        status.className = "status-text success";
        
    } catch (err) {
        status.innerText = err.message.startsWith("หาหน้า") ? "Error: " + err.message : err.message;
        status.className = "status-text error";
    }
});
// ==========================================
// 13. PRINT LABEL FEATURE (10cm x 10cm) - COMBINED FIX
// ==========================================

// Country code to full name mapping
const countryFullNames = {
    'US': 'UNITED STATES OF AMERICA (USA)', 'JP': 'JAPAN', 'CN': 'CHINA', 'KR': 'SOUTH KOREA',
    'TW': 'TAIWAN', 'HK': 'HONG KONG', 'SG': 'SINGAPORE', 'MY': 'MALAYSIA',
    'VN': 'VIETNAM', 'IN': 'INDIA', 'AU': 'AUSTRALIA', 'NZ': 'NEW ZEALAND',
    'GB': 'UNITED KINGDOM', 'DE': 'GERMANY', 'FR': 'FRANCE', 'IT': 'ITALY',
    'ES': 'SPAIN', 'NL': 'NETHERLANDS', 'CH': 'SWITZERLAND', 'CA': 'CANADA',
    'TH': 'THAILAND', 'PH': 'PHILIPPINES', 'ID': 'INDONESIA', 'BR': 'BRAZIL',
    'MX': 'MEXICO', 'AE': 'UNITED ARAB EMIRATES', 'SA': 'SAUDI ARABIA',
    'RU': 'RUSSIA', 'TR': 'TURKEY', 'SE': 'SWEDEN', 'NO': 'NORWAY',
    'DK': 'DENMARK', 'FI': 'FINLAND', 'BE': 'BELGIUM', 'AT': 'AUSTRIA',
    'PL': 'POLAND', 'CZ': 'CZECH REPUBLIC', 'PT': 'PORTUGAL', 'IE': 'IRELAND',
    'IL': 'ISRAEL', 'ZA': 'SOUTH AFRICA', 'CL': 'CHILE', 'AR': 'ARGENTINA',
    'CO': 'COLOMBIA', 'PE': 'PERU',
    'AK': 'ALASKA', 'AS': 'AMERICAN SAMOA', 'FM': 'FEDERATED STATES OF MICRONESIA',
    'GU': 'GUAM', 'GTMO': 'GUANTANAMO BAY', 'HI': 'HAWAII', 'MARIANAS': 'MARIANAS',
    'MH': 'MARSHALL ISLANDS', 'MP': 'NORTHERN MARIANA ISLANDS', 'PW': 'PALAU',
    'PR': 'PUERTO RICO', 'VI': 'VIRGIN ISLANDS (U.S.A.)', 'WAKE': 'WAKE ISLANDS'
};

function getCountryFullName(code) {
    if (!code) return '';
    const upper = code.toUpperCase();
    return countryFullNames[upper] || upper;
}

function getLabelData() {
    const sName = document.getElementById('rev_sname').value.trim();
    const sTel = document.getElementById('rev_stel').value.trim();
    const sEmail = document.getElementById('rev_semail').value.trim();
    const sPremise = document.getElementById('rev_spremise').value.trim();
    const sSub = document.getElementById('rev_ssubdistrict').value.trim();
    const sDist = document.getElementById('rev_sdistrict').value.trim();
    const sProv = document.getElementById('rev_sprovince').value.trim();
    const sPost = document.getElementById('rev_spostalcode').value.trim();

    const rName = document.getElementById('rev_rname').value.trim();
    const rTel = document.getElementById('rev_rtel').value.trim();
    const rEmail = document.getElementById('rev_remail').value.trim();
    const rPremise = document.getElementById('rev_premise').value.trim();
    const rCity = document.getElementById('rev_city').value.trim();
    const rState = document.getElementById('rev_state').value.trim();
    const rPost = document.getElementById('rev_rpostcode').value.trim();
    const rCountry = getDestinationLabelName(document.getElementById('rev_rcountry').value.trim());

    return {
        sender: { sName, sTel, sEmail, sPremise, sSub, sDist, sProv, sPost },
        receiver: { rName, rTel, rEmail, rPremise, rCity, rState, rPost, rCountry }
    };
}

function buildSenderHTML(data, mode) {
    const { sName, sTel, sEmail, sPremise, sSub, sDist, sProv, sPost } = data.sender;
    const cls = mode === 'combined' ? 'combined-mode' : 'separate-mode';
    const lines = [];
    
    if (sName) lines.push(`<div class="name ${cls}">${escapeHtml(sName)}</div>`);
    if (sTel) lines.push(`<div class="tel ${cls}">Tel: ${escapeHtml(sTel)}</div>`);
    if (sEmail) lines.push(`<div class="tel ${cls}">Email: ${escapeHtml(sEmail)}</div>`);
    if (sPremise) lines.push(`<div class="address ${cls}">${escapeHtml(sPremise)}</div>`);
    
    const loc = [sSub, sDist].filter(Boolean).join(', ');
    if (loc) lines.push(`<div class="address ${cls}">${escapeHtml(loc)}</div>`);
    
    const provPost = [sProv, sPost].filter(Boolean).join(' ');
    if (provPost) lines.push(`<div class="address ${cls}">${escapeHtml(provPost)}</div>`);
    
    lines.push(`<div class="country ${cls}">THAILAND</div>`);
    
    return lines.join('\n');
}

function buildReceiverHTML(data, mode) {
    const { rName, rTel, rEmail, rPremise, rCity, rState, rPost, rCountry } = data.receiver;
    const cls = mode === 'combined' ? 'combined-mode' : 'separate-mode';
    const lines = [];
    
    if (rName) lines.push(`<div class="name ${cls}">${escapeHtml(rName)}</div>`);
    if (rTel) lines.push(`<div class="tel ${cls}">Tel: ${escapeHtml(rTel)}</div>`);
    if (rEmail) lines.push(`<div class="tel ${cls}">Email: ${escapeHtml(rEmail)}</div>`);
    if (rPremise) lines.push(`<div class="address ${cls}">${escapeHtml(rPremise)}</div>`);
    
    const loc = [rCity, rState].filter(Boolean).join(', ');
    if (loc) lines.push(`<div class="address ${cls}">${escapeHtml(loc)}</div>`);
    
    if (rPost) lines.push(`<div class="address ${cls}">${escapeHtml(rPost)}</div>`);
    if (rCountry) lines.push(`<div class="country ${cls}">${escapeHtml(rCountry)}</div>`);
    
    return lines.join('\n');
}

function buildSenderCompactHTML(data) {
    const { sName, sTel, sEmail, sPremise, sSub, sDist, sProv, sPost } = data.sender;
    const lines = [];
    
    if (sName) lines.push(`<div class="name separate-mode">${escapeHtml(sName)}</div>`);
    if (sTel) lines.push(`<div class="tel separate-mode">Tel: ${escapeHtml(sTel)}</div>`);
    if (sEmail) lines.push(`<div class="tel separate-mode">Email: ${escapeHtml(sEmail)}</div>`);
    if (sPremise) lines.push(`<div class="address separate-mode">${escapeHtml(sPremise)}</div>`);
    
    const senderLocalityLine = [sSub, sDist, sProv, sPost].filter(Boolean).join(', ');
    if (senderLocalityLine) lines.push(`<div class="address separate-mode">${escapeHtml(senderLocalityLine)}</div>`);
    
    lines.push(`<div class="country separate-mode">THAILAND</div>`);
    
    return lines.join('\n');
}

function buildReceiverCompactHTML(data) {
    const { rName, rTel, rEmail, rPremise, rCity, rState, rPost, rCountry } = data.receiver;
    const lines = [];
    
    if (rName) lines.push(`<div class="name separate-mode">${escapeHtml(rName)}</div>`);
    if (rTel) lines.push(`<div class="tel separate-mode">Tel: ${escapeHtml(rTel)}</div>`);
    if (rEmail) lines.push(`<div class="tel separate-mode">Email: ${escapeHtml(rEmail)}</div>`);
    if (rPremise) lines.push(`<div class="address separate-mode">${escapeHtml(rPremise)}</div>`);
    
    const receiverLocalityLine = [rCity, rState, rPost].filter(Boolean).join(', ');
    if (receiverLocalityLine) lines.push(`<div class="address separate-mode">${escapeHtml(receiverLocalityLine)}</div>`);
    
    if (rCountry) lines.push(`<div class="country separate-mode">${escapeHtml(rCountry)}</div>`);
    
    return lines.join('\n');
}

function getThermalPrintCSS() {
    return `
        @page {
            size: 10cm 10cm;
            margin: 0;
        }
        
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        html, body {
            width: 10cm;
            font-family: 'Arial', 'Helvetica', sans-serif;
            background: white;
            color: #000;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        /* Separate mode body — 2 sheets = 20cm total */
        body.separate-body {
            height: 20cm;
        }
        
        /* Combined mode body — 1 sheet = 10cm total */
        body.combined-body {
            height: 10cm;
        }

        /* ============================
           MODE: COMBINED (1 sheet)
           ============================ */
        .combined {
            width: 10cm;
            height: 10cm;
            display: flex;
            flex-direction: column;
            padding: 3mm;
            gap: 2mm;
        }
        
        .combined .section {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            padding: 2.5mm 3mm;
            border: 1px solid #000;
            min-height: 0;
            overflow: hidden;
        }

        .combined .from-section {
            flex: 0 0 29%;
            padding: 2mm 2.5mm;
        }

        .combined .to-section {
            flex: 1 1 auto;
            padding: 3mm 3.5mm;
            border-width: 1.5px;
        }
        
        .combined .tag {
            font-size: 7pt;
            font-weight: bold;
            letter-spacing: 0.5mm;
            margin-bottom: 1.5mm;
            padding-bottom: 0.5mm;
            border-bottom: 0.5px solid #000;
            text-transform: uppercase;
            flex-shrink: 0;
        }

        /* Smaller fonts for combined mode (limited space) */
        .name.combined-mode {
            font-size: 11pt;
            font-weight: bold;
            line-height: 1.15;
            margin-bottom: 0.8mm;
            overflow-wrap: anywhere;
            text-transform: uppercase;
        }
        
        .tel.combined-mode {
            font-size: 8pt;
            font-weight: bold;
            margin-bottom: 0.8mm;
        }
        
        .address.combined-mode {
            font-size: 7.5pt;
            line-height: 1.2;
            overflow-wrap: anywhere;
        }
        
        .country.combined-mode {
            font-size: 10.5pt;
            font-weight: bold;
            margin-top: 1mm;
            text-transform: uppercase;
            overflow-wrap: anywhere;
        }

        .to-section .name.combined-mode {
            font-size: 13pt;
        }

        .to-section .address.combined-mode {
            font-size: 9pt;
        }

        .to-section .country.combined-mode {
            font-size: 13pt;
            margin-top: 1.5mm;
        }

        /* ============================
           MODE: SEPARATE (2 sheets)
           ============================ */
        .separate {
            width: 10cm;
            height: 10cm;
            display: flex;
            flex-direction: column;
            padding: 5mm 6mm;
            page-break-after: always;
        }
        
        .separate:last-child {
            page-break-after: avoid;
        }
        
        .separate .tag {
            font-size: 10pt;
            font-weight: bold;
            letter-spacing: 1mm;
            text-transform: uppercase;
            margin-bottom: 3mm;
            padding-bottom: 2mm;
            border-bottom: 2px solid #000;
            flex-shrink: 0;
        }
        
        .separate .body {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            padding-top: 2mm;
            min-height: 0;
            overflow: hidden;
        }

        /* Larger fonts for separate mode (full 10x10) */
        .name.separate-mode {
            font-size: 16pt;
            font-weight: bold;
            line-height: 1.2;
            margin-bottom: 2mm;
            overflow-wrap: anywhere;
            text-transform: uppercase;
        }
        
        .tel.separate-mode {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 2mm;
        }
        
        .address.separate-mode {
            font-size: 11pt;
            line-height: 1.4;
            overflow-wrap: anywhere;
        }
        
        .country.separate-mode {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 3mm;
            text-transform: uppercase;
            overflow-wrap: anywhere;
        }

        @media print {
            html, body {
                width: 10cm;
            }
            body.separate-body {
                height: auto;
            }
            body.combined-body {
                height: 10cm;
            }
            .separate {
                page-break-after: always;
            }
        }
    `;
}

const printPaperPresets = {
    '10x10': {
        label: '10x10 Label',
        pageWidthMm: 100,
        pageHeightMm: 100,
        sheetWidthMm: 100,
        sheetHeightMm: 100,
        copies: 1,
        columns: 1,
        gapMm: 0,
        pagePaddingMm: 0
    },
    '4x6': {
        label: '4x6 Shipping Label',
        pageWidthMm: 101.6,
        pageHeightMm: 152.4,
        sheetWidthMm: 101.6,
        sheetHeightMm: 152.4,
        copies: 1,
        columns: 1,
        gapMm: 0,
        pagePaddingMm: 0
    },
    'a6': {
        label: 'A6 Shipping Label',
        pageWidthMm: 105,
        pageHeightMm: 148,
        sheetWidthMm: 105,
        sheetHeightMm: 148,
        copies: 1,
        columns: 1,
        gapMm: 0,
        pagePaddingMm: 0
    },
    'a5': {
        label: 'A5 Large Label',
        pageWidthMm: 148,
        pageHeightMm: 210,
        sheetWidthMm: 148,
        sheetHeightMm: 210,
        copies: 1,
        columns: 1,
        gapMm: 0,
        pagePaddingMm: 0
    },
    'a4-2up': {
        label: 'A4 2-up',
        pageWidthMm: 210,
        pageHeightMm: 297,
        sheetWidthMm: 190,
        sheetHeightMm: 135,
        copies: 2,
        columns: 1,
        gapMm: 8,
        pagePaddingMm: 8
    },
    'a4-box': {
        label: 'A4 แนวนอน - จ่าหน้ากล่อง',
        pageWidthMm: 297,
        pageHeightMm: 210,
        sheetWidthMm: 297,
        sheetHeightMm: 210,
        copies: 1,
        columns: 1,
        gapMm: 0,
        pagePaddingMm: 0,
        layout: 'box-diagonal'
    }
};

const defaultPrintSettings = {
    paper: '4x6',
    layout: 'combined'
};

let currentPrintSettings = { ...defaultPrintSettings };

function getPrintPreset(settings = currentPrintSettings) {
    return printPaperPresets[settings.paper] || printPaperPresets[defaultPrintSettings.paper];
}

function normalizePrintSettings(settings = {}) {
    const paper = printPaperPresets[settings.paper] ? settings.paper : defaultPrintSettings.paper;
    const preset = printPaperPresets[paper];
    const layout = preset.layout || (['combined', 'separate'].includes(settings.layout) ? settings.layout : defaultPrintSettings.layout);
    return { paper, layout };
}

function savePrintSettings(settings) {
    settings = normalizePrintSettings(settings);
    currentPrintSettings = settings;
    if (chrome?.storage?.local) {
        chrome.storage.local.set({ printLabelSettings: settings });
    }
}

function updatePrintPresetUI(settings = currentPrintSettings) {
    const normalized = normalizePrintSettings(settings);
    const paperSelect = document.getElementById('printPaperPresetSelect');
    const layoutSelect = document.getElementById('printLayoutSelect');
    const lastUsedButton = document.getElementById('printLabelLastUsedBtn');
    const preset = getPrintPreset(normalized);
    const layoutNames = {
        combined: 'รวมในแผ่นเดียว',
        separate: 'แยก FROM/TO',
        'box-diagonal': 'จ่าหน้ากล่อง'
    };
    const layoutLabel = layoutNames[normalized.layout] || layoutNames.combined;

    if (paperSelect) paperSelect.value = normalized.paper;
    if (layoutSelect) layoutSelect.value = normalized.layout;
    if (lastUsedButton) lastUsedButton.textContent = `🖨️ พิมพ์ ${preset.label} (${layoutLabel})`;
}

function getSelectedPrintSettings() {
    return normalizePrintSettings({
        paper: document.getElementById('printPaperPresetSelect')?.value,
        layout: document.getElementById('printLayoutSelect')?.value
    });
}

function loadPrintSettings() {
    if (!chrome?.storage?.local) {
        updatePrintPresetUI(currentPrintSettings);
        return;
    }

    chrome.storage.local.get(['printLabelSettings'], result => {
        currentPrintSettings = normalizePrintSettings(result?.printLabelSettings || defaultPrintSettings);
        updatePrintPresetUI(currentPrintSettings);
    });
}

function buildCombinedSheetHTML(data) {
    return `
    <div class="editor-sheet combined-editor-sheet with-border">
        <div class="combined-editor-block from-editor-block from-editor-sheet">
            <div class="tag">FROM</div>
            <div class="editable-label from-font-target" contenteditable="true" spellcheck="false">
                ${buildSenderCompactHTML(data)}
            </div>
        </div>
        <button type="button" class="combined-resizer" aria-label="Drag to resize FROM and TO boxes"></button>
        <div class="combined-editor-block to-editor-block to-editor-sheet">
            <div class="tag">TO</div>
            <div class="editable-label to-font-target" contenteditable="true" spellcheck="false">
                ${buildReceiverCompactHTML(data)}
            </div>
        </div>
    </div>`;
}

function buildBoxDiagonalSheetHTML(data) {
    return `
    <div class="editor-sheet box-diagonal-sheet with-border">
        <div class="box-from-block from-editor-sheet">
            <div class="tag">FROM</div>
            <div class="editable-label from-font-target" contenteditable="true" spellcheck="false">
                ${buildSenderCompactHTML(data)}
            </div>
        </div>
        <div class="box-to-block to-editor-sheet">
            <div class="tag">TO</div>
            <div class="editable-label to-font-target" contenteditable="true" spellcheck="false">
                ${buildReceiverCompactHTML(data)}
            </div>
        </div>
    </div>`;
}

function buildSheetHTMLForPreset(data, preset) {
    if (preset.layout === 'box-diagonal') return buildBoxDiagonalSheetHTML(data);
    return buildCombinedSheetHTML(data);
}

function buildSeparateSheetsHTML(data) {
    return `
    <div class="editor-sheet from-editor-sheet with-border">
        <div class="tag">FROM</div>
        <div class="editable-label from-font-target" contenteditable="true" spellcheck="false">
            ${buildSenderHTML(data, 'separate')}
        </div>
    </div>
    
    <div class="editor-sheet to-editor-sheet with-border">
        <div class="tag">TO</div>
        <div class="editable-label to-font-target" contenteditable="true" spellcheck="false">
            ${buildReceiverHTML(data, 'separate')}
        </div>
    </div>`;
}

function repeatPrintCopies(sheetHTML, preset) {
    return Array.from({ length: preset.copies || 1 }, () => sheetHTML).join('\n');
}

function openPrintLabelFromSettings(settings) {
    const normalized = normalizePrintSettings(settings);
    savePrintSettings(normalized);
    updatePrintPresetUI(normalized);

    if (normalized.layout === 'separate') openPrintLabelSeparate(normalized);
    else openPrintLabelCombined(normalized);
}

function setupPrintPresetControls() {
    loadPrintSettings();

    const paperSelect = document.getElementById('printPaperPresetSelect');
    const layoutSelect = document.getElementById('printLayoutSelect');
    const lastUsedButton = document.getElementById('printLabelLastUsedBtn');
    const openEditorButton = document.getElementById('printLabelOpenEditorBtn');

    const handleChange = () => {
        const settings = getSelectedPrintSettings();
        savePrintSettings(settings);
        updatePrintPresetUI(settings);
    };

    paperSelect?.addEventListener('change', handleChange);
    layoutSelect?.addEventListener('change', handleChange);
    lastUsedButton?.addEventListener('click', () => openPrintLabelFromSettings(currentPrintSettings));
    openEditorButton?.addEventListener('click', () => openPrintLabelFromSettings(getSelectedPrintSettings()));
}

function openPrintLabelCombined(settings = currentPrintSettings) {
    const data = getLabelData();
    if (!runLabelValidationBeforeOutput(data, 'print')) return;
    const preset = getPrintPreset(settings);
    const sheetHTML = buildSheetHTMLForPreset(data, preset);

    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${preset.label} Combined Label Editor</title>
    <style>${getSeparatePrintEditorCSS(preset)}</style>
</head>
<body>
    ${getPrintEditorToolbarHTML()}
    <div class="preview-stage ${preset.copies > 1 ? 'multi-up-stage' : ''}">
    ${repeatPrintCopies(sheetHTML, preset)}
    </div>
</body>
</html>`;

    openPrintEditorWindow(html, `${preset.label} combined`, setupSeparatePrintEditor);
}

function getPrintEditorToolbarHTML() {
    return `
    <div class="editor-toolbar">
        <div class="control-group">
            <span class="control-label">Font</span>
            <button type="button" data-action="font-dec">A-</button>
            <span class="control-value" id="fontValue">100%</span>
            <button type="button" data-action="font-inc">A+</button>
        </div>
        <div class="control-group">
            <span class="control-label">Padding</span>
            <button type="button" data-action="padding-dec">-</button>
            <span class="control-value" id="paddingValue">4mm</span>
            <button type="button" data-action="padding-inc">+</button>
        </div>
        <div class="control-group">
            <span class="control-label">Spacing</span>
            <button type="button" data-action="spacing-dec">-</button>
            <span class="control-value" id="spacingValue">1.25x</span>
            <button type="button" data-action="spacing-inc">+</button>
        </div>
        <div class="control-group">
            <button type="button" data-action="fit">Fit</button>
            <button type="button" data-action="from-less">FROM-</button>
            <button type="button" data-action="from-more">FROM+</button>
            <button type="button" data-action="to-less">TO-</button>
            <button type="button" data-action="to-more">TO+</button>
            <button type="button" data-action="border">Border</button>
            <button type="button" data-action="reset">Reset</button>
            <button type="button" data-action="print" class="primary">Print</button>
        </div>
        <div class="editor-warning" id="editorWarning">คลิกบนฉลากเพื่อแก้ข้อความ ปรับขนาดด้วยปุ่ม +/- แล้วกด Print</div>
    </div>`;
}

function getSeparatePrintEditorCSS(preset = printPaperPresets['10x10']) {
    return `
        @page {
            size: ${preset.pageWidthMm}mm ${preset.pageHeightMm}mm;
            margin: 0;
        }

        * {
            box-sizing: border-box;
        }

        html, body {
            margin: 0;
            min-height: 100%;
            font-family: Arial, Helvetica, sans-serif;
            background: #e5e7eb;
            color: #111827;
        }

        .editor-toolbar {
            position: sticky;
            top: 0;
            z-index: 10;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            padding: 10px;
            background: #ffffff;
            border-bottom: 1px solid #d1d5db;
            box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
        }

        .control-group {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: #f9fafb;
        }

        .control-label {
            min-width: 54px;
            font-size: 11px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
        }

        .control-value {
            min-width: 42px;
            text-align: center;
            font-size: 11px;
            font-weight: 700;
            color: #111827;
        }

        .editor-toolbar button {
            min-width: 34px;
            height: 30px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            background: #ffffff;
            color: #111827;
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
        }

        .editor-toolbar button:hover {
            background: #eef2ff;
            border-color: #818cf8;
        }

        .editor-toolbar .primary {
            min-width: 72px;
            background: #16a34a;
            border-color: #15803d;
            color: #ffffff;
        }

        .editor-toolbar .primary:hover {
            background: #15803d;
        }

        .editor-warning {
            flex: 1 1 180px;
            min-width: 180px;
            font-size: 12px;
            font-weight: 700;
            color: #64748b;
        }

        .preview-stage {
            display: flex;
            flex-wrap: wrap;
            gap: 18px;
            align-items: flex-start;
            justify-content: center;
            padding: 18px;
        }

        .preview-stage.multi-up-stage {
            display: grid;
            grid-template-columns: repeat(${preset.columns || 1}, ${preset.sheetWidthMm}mm);
            gap: ${preset.gapMm || 0}mm;
            align-items: start;
            justify-content: center;
            padding: ${preset.pagePaddingMm || 0}mm;
        }

        .editor-sheet {
            width: ${preset.sheetWidthMm}mm;
            height: ${preset.sheetHeightMm}mm;
            display: flex;
            flex-direction: column;
            padding: var(--sheet-padding, 4mm);
            background: #ffffff;
            color: #000000;
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.2);
            page-break-after: always;
            overflow: hidden;
        }

        .editor-sheet:last-child {
            page-break-after: avoid;
        }

        .multi-up-stage .editor-sheet {
            page-break-after: auto;
            break-inside: avoid;
        }

        .editor-sheet.with-border {
            border: 1.5px solid #000000;
        }

        .combined-editor-sheet {
            gap: 2mm;
            --from-ratio: 42%;
        }

        .box-diagonal-sheet {
            position: relative;
            display: block;
        }

        .box-from-block,
        .box-to-block {
            position: absolute;
            min-height: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .box-from-block {
            left: 12mm;
            top: 10mm;
            width: 118mm;
            max-height: 78mm;
        }

        .box-to-block {
            right: 12mm;
            bottom: 14mm;
            width: 172mm;
            max-height: 112mm;
        }

        .box-diagonal-sheet .tag {
            margin-bottom: 2mm;
        }

        .combined-editor-block {
            min-height: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .from-editor-block {
            flex: 0 0 var(--from-ratio, 42%);
        }

        .to-editor-block {
            flex: 1 1 auto;
        }

        .combined-resizer {
            position: relative;
            flex: 0 0 4mm;
            margin: -1mm 0;
            border: 0;
            background: transparent;
            cursor: ns-resize;
            touch-action: none;
        }

        .combined-resizer::before {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            border-top: 1px dashed #64748b;
        }

        .combined-resizer::after {
            content: "drag";
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            padding: 1px 6px;
            border: 1px solid #64748b;
            border-radius: 999px;
            background: #ffffff;
            color: #334155;
            font-size: 7pt;
            font-weight: 800;
            letter-spacing: 0;
        }

        .editor-sheet .tag {
            flex-shrink: 0;
            font-size: 10pt;
            font-weight: 800;
            letter-spacing: 1mm;
            text-transform: uppercase;
            margin-bottom: 2.5mm;
            padding-bottom: 1.5mm;
            border-bottom: 2px solid #000000;
        }

        .editable-label {
            flex: 1;
            min-height: 0;
            outline: none;
            overflow: hidden;
        }

        .editable-label:focus {
            box-shadow: inset 0 0 0 1px #2563eb;
        }

        .name.separate-mode {
            font-size: var(--name-size, 18pt);
            line-height: var(--line-height, 1.25);
            margin-bottom: 2mm;
            font-weight: 800;
            text-transform: uppercase;
            overflow-wrap: anywhere;
        }

        .tel.separate-mode {
            font-size: var(--tel-size, 12pt);
            line-height: var(--line-height, 1.25);
            margin-bottom: 2mm;
            font-weight: 700;
            overflow-wrap: anywhere;
        }

        .address.separate-mode {
            font-size: var(--address-size, 13pt);
            line-height: var(--line-height, 1.25);
            overflow-wrap: anywhere;
        }

        .country.separate-mode {
            font-size: var(--country-size, 18pt);
            line-height: var(--line-height, 1.25);
            margin-top: 3mm;
            font-weight: 900;
            text-transform: uppercase;
            overflow-wrap: anywhere;
        }

        @media print {
            html, body {
                width: ${preset.pageWidthMm}mm;
                background: #ffffff;
            }

            .editor-toolbar {
                display: none;
            }

            .combined-resizer {
                display: none;
            }

            .preview-stage {
                display: block;
                padding: 0;
            }

            .preview-stage.multi-up-stage {
                display: grid;
                grid-template-columns: repeat(${preset.columns || 1}, ${preset.sheetWidthMm}mm);
                gap: ${preset.gapMm || 0}mm;
                justify-content: center;
                padding: ${preset.pagePaddingMm || 0}mm;
            }

            .editor-sheet {
                box-shadow: none;
                margin: 0;
            }
        }
    `;
}

function getSeparatePrintEditorScript() {
    return `
        (function () {
            const fontScaleMin = 0.2;
            const fontScaleMax = 1.8;
            const state = {
                fontScale: 1,
                paddingMm: 4,
                lineHeight: 1.25,
                border: true
            };

            const values = {
                font: document.getElementById('fontValue'),
                padding: document.getElementById('paddingValue'),
                spacing: document.getElementById('spacingValue'),
                warning: document.getElementById('editorWarning')
            };

            const sheets = Array.from(document.querySelectorAll('.editor-sheet'));
            const editableAreas = Array.from(document.querySelectorAll('.editable-label'));

            function clamp(value, min, max) {
                return Math.max(min, Math.min(max, value));
            }

            function round(value, places) {
                const factor = Math.pow(10, places || 0);
                return Math.round(value * factor) / factor;
            }

            function applyState() {
                sheets.forEach(sheet => {
                    sheet.style.setProperty('--sheet-padding', state.paddingMm + 'mm');
                    sheet.style.setProperty('--line-height', String(state.lineHeight));
                    sheet.style.setProperty('--name-size', round(18 * state.fontScale, 1) + 'pt');
                    sheet.style.setProperty('--tel-size', round(12 * state.fontScale, 1) + 'pt');
                    sheet.style.setProperty('--address-size', round(13 * state.fontScale, 1) + 'pt');
                    sheet.style.setProperty('--country-size', round(18 * state.fontScale, 1) + 'pt');
                    sheet.classList.toggle('with-border', state.border);
                });

                values.font.textContent = Math.round(state.fontScale * 100) + '%';
                values.padding.textContent = state.paddingMm + 'mm';
                values.spacing.textContent = round(state.lineHeight, 2) + 'x';
                checkOverflow();
            }

            function checkOverflow() {
                return editableAreas.some(area => area.scrollHeight > area.clientHeight + 1);
            }

            function fitToPage() {
                state.fontScale = fontScaleMin;
                applyState();

                for (let next = state.fontScale + 0.03; next <= 1.75; next += 0.03) {
                    state.fontScale = round(next, 2);
                    applyState();
                    if (checkOverflow()) {
                        state.fontScale = round(next - 0.03, 2);
                        applyState();
                        return;
                    }
                }
            }

            document.querySelector('.editor-toolbar').addEventListener('click', event => {
                const action = event.target.getAttribute('data-action');
                if (!action) return;

                if (action === 'font-inc') state.fontScale = clamp(round(state.fontScale + 0.05, 2), fontScaleMin, fontScaleMax);
                if (action === 'font-dec') state.fontScale = clamp(round(state.fontScale - 0.05, 2), fontScaleMin, fontScaleMax);
                if (action === 'padding-inc') state.paddingMm = clamp(state.paddingMm + 1, 1, 10);
                if (action === 'padding-dec') state.paddingMm = clamp(state.paddingMm - 1, 1, 10);
                if (action === 'spacing-inc') state.lineHeight = clamp(round(state.lineHeight + 0.05, 2), 1, 1.8);
                if (action === 'spacing-dec') state.lineHeight = clamp(round(state.lineHeight - 0.05, 2), 1, 1.8);
                if (action === 'border') state.border = !state.border;
                if (action === 'fit') fitToPage();
                if (action === 'reset') {
                    state.fontScale = 1;
                    state.paddingMm = 4;
                    state.lineHeight = 1.25;
                    state.border = true;
                }
                if (action === 'print') {
                    window.print();
                }

                if (action !== 'fit' && action !== 'print') applyState();
            });

            editableAreas.forEach(area => area.addEventListener('input', checkOverflow));

            window.addEventListener('load', () => {
                fitToPage();
                setTimeout(checkOverflow, 100);
            });
        })();
    `;
}

function setupSeparatePrintEditor(printTab) {
    const doc = printTab.document;
    const toolbar = doc.querySelector('.editor-toolbar');
    if (!toolbar) return;

    const fontScaleMin = 0.2;
    const fontScaleMax = 1.8;
    const state = {
        fontScale: 1,
        fromFontScale: 1,
        toFontScale: 1,
        paddingMm: 4,
        lineHeight: 1.25,
        border: true,
        fromRatio: 42
    };

    const values = {
        font: doc.getElementById('fontValue'),
        padding: doc.getElementById('paddingValue'),
        spacing: doc.getElementById('spacingValue'),
        warning: doc.getElementById('editorWarning')
    };

    const sheets = Array.from(doc.querySelectorAll('.editor-sheet'));
    const fontTargets = Array.from(doc.querySelectorAll('.editor-sheet, .combined-editor-block, .from-font-target, .to-font-target'));
    const editableAreas = Array.from(doc.querySelectorAll('.editable-label'));
    const combinedSheet = doc.querySelector('.combined-editor-sheet');
    const combinedResizer = doc.querySelector('.combined-resizer');

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const round = (value, places = 0) => {
        const factor = Math.pow(10, places);
        return Math.round(value * factor) / factor;
    };

    function checkOverflow() {
        return editableAreas.some(area => area.scrollHeight > area.clientHeight + 1);
    }

    function getSheetFontScale(sheet) {
        if (sheet.classList.contains('from-font-target')) return state.fontScale * state.fromFontScale;
        if (sheet.classList.contains('to-font-target')) return state.fontScale * state.toFontScale;
        if (sheet.classList.contains('from-editor-sheet')) return state.fontScale * state.fromFontScale;
        if (sheet.classList.contains('to-editor-sheet')) return state.fontScale * state.toFontScale;
        return state.fontScale;
    }

    function applyState() {
        sheets.forEach(sheet => {
            sheet.style.setProperty('--sheet-padding', state.paddingMm + 'mm');
            sheet.style.setProperty('--line-height', String(state.lineHeight));
            sheet.classList.toggle('with-border', state.border);
        });

        fontTargets.forEach(target => {
            const targetFontScale = getSheetFontScale(target);
            target.style.setProperty('--name-size', round(18 * targetFontScale, 1) + 'pt');
            target.style.setProperty('--tel-size', round(12 * targetFontScale, 1) + 'pt');
            target.style.setProperty('--address-size', round(13 * targetFontScale, 1) + 'pt');
            target.style.setProperty('--country-size', round(18 * targetFontScale, 1) + 'pt');
        });

        if (combinedSheet) {
            combinedSheet.style.setProperty('--from-ratio', state.fromRatio + '%');
        }

        if (values.font) values.font.textContent = Math.round(state.fontScale * 100) + '%';
        if (values.padding) values.padding.textContent = state.paddingMm + 'mm';
        if (values.spacing) values.spacing.textContent = round(state.lineHeight, 2) + 'x';
        checkOverflow();
    }

    function fitToPage() {
        state.fontScale = fontScaleMin;
        applyState();

        for (let next = state.fontScale + 0.03; next <= 1.75; next += 0.03) {
            state.fontScale = round(next, 2);
            applyState();
            if (checkOverflow()) {
                state.fontScale = round(next - 0.03, 2);
                applyState();
                return;
            }
        }
    }

    function setCombinedSplit(nextRatio) {
        if (!combinedSheet) return;
        state.fromRatio = clamp(Math.round(nextRatio), 22, 68);
        applyState();
    }

    function adjustTargetFont(target, delta) {
        if (target === 'from') state.fromFontScale = clamp(round(state.fromFontScale + delta, 2), fontScaleMin, fontScaleMax);
        if (target === 'to') state.toFontScale = clamp(round(state.toFontScale + delta, 2), fontScaleMin, fontScaleMax);
    }

    toolbar.addEventListener('click', event => {
        const action = event.target.getAttribute('data-action');
        if (!action) return;

        if (action === 'font-inc') state.fontScale = clamp(round(state.fontScale + 0.05, 2), fontScaleMin, fontScaleMax);
        if (action === 'font-dec') state.fontScale = clamp(round(state.fontScale - 0.05, 2), fontScaleMin, fontScaleMax);
        if (action === 'padding-inc') state.paddingMm = clamp(state.paddingMm + 1, 1, 10);
        if (action === 'padding-dec') state.paddingMm = clamp(state.paddingMm - 1, 1, 10);
        if (action === 'spacing-inc') state.lineHeight = clamp(round(state.lineHeight + 0.05, 2), 1, 1.8);
        if (action === 'spacing-dec') state.lineHeight = clamp(round(state.lineHeight - 0.05, 2), 1, 1.8);
        if (action === 'from-less') adjustTargetFont('from', -0.05);
        if (action === 'from-more') adjustTargetFont('from', 0.05);
        if (action === 'to-less') adjustTargetFont('to', -0.05);
        if (action === 'to-more') adjustTargetFont('to', 0.05);
        if (action === 'border') state.border = !state.border;
        if (action === 'fit') fitToPage();
        if (action === 'reset') {
            state.fontScale = 1;
            state.fromFontScale = 1;
            state.toFontScale = 1;
            state.paddingMm = 4;
            state.lineHeight = 1.25;
            state.border = true;
            state.fromRatio = 42;
        }
        if (action === 'print') {
            printTab.print();
        }

        if (action !== 'fit' && action !== 'print') applyState();
    });

    if (combinedResizer && combinedSheet) {
        let dragging = false;

        const updateSplitFromPointer = event => {
            const rect = combinedSheet.getBoundingClientRect();
            const y = event.clientY - rect.top;
            const ratio = (y / rect.height) * 100;
            setCombinedSplit(ratio);
        };

        combinedResizer.addEventListener('pointerdown', event => {
            dragging = true;
            combinedResizer.setPointerCapture(event.pointerId);
            updateSplitFromPointer(event);
        });

        combinedResizer.addEventListener('pointermove', event => {
            if (!dragging) return;
            updateSplitFromPointer(event);
        });

        combinedResizer.addEventListener('pointerup', event => {
            dragging = false;
            try {
                combinedResizer.releasePointerCapture(event.pointerId);
            } catch (err) {}
        });

        combinedResizer.addEventListener('pointercancel', () => {
            dragging = false;
        });
    }

    editableAreas.forEach(area => area.addEventListener('input', checkOverflow));
    setTimeout(() => {
        fitToPage();
        checkOverflow();
    }, 100);
}

function openPrintLabelSeparate(settings = currentPrintSettings) {
    const data = getLabelData();
    if (!runLabelValidationBeforeOutput(data, 'print')) return;
    const preset = getPrintPreset(settings);

    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${preset.label} Separate Label Editor</title>
    <style>${getSeparatePrintEditorCSS(preset)}</style>
</head>
<body>
    ${getPrintEditorToolbarHTML()}
    <div class="preview-stage">
    ${buildSeparateSheetsHTML(data)}
    </div>
</body>
</html>`;

    openPrintEditorWindow(html, `${preset.label} separate`, setupSeparatePrintEditor);
}

function openPrintEditorWindow(printContent, labelType, setupEditor) {
    const printTab = window.open('', '_blank');
    if (printTab) {
        printTab.document.open();
        printTab.document.write(printContent);
        printTab.document.close();

        if (typeof setupEditor === 'function') {
            setTimeout(() => setupEditor(printTab), 100);
        }

        document.getElementById('status').innerText = 
            `เปิด editor สำหรับ ${labelType} label แล้ว ปรับเสร็จค่อยกด Print`;
        document.getElementById('status').className = "status-text success";
    } else {
        alert("Please allow pop-ups for this extension");
    }
}

function openPrintWindow(printContent, labelType) {
    const blob = new Blob([printContent], { type: 'text/html;charset=UTF-8' });
    const blobUrl = URL.createObjectURL(blob);
    const printTab = window.open(blobUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    
    if (printTab) {
        document.getElementById('status').innerText = 
            `เปิดหน้าพิมพ์ ${labelType} label แล้ว หาก dialog ไม่ขึ้นให้กด Ctrl+P`;
        document.getElementById('status').className = "status-text success";
    } else {
        alert("Please allow pop-ups for this extension");
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
// ==========================================
// 12. INITIALIZATION ON LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadReviewCache();
    renderHistoryUI();
    setupLiveCacheBackup();
    setupPrintPresetControls();
});
