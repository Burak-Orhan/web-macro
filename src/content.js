let inspecting = false;
let isMacroRunning = false;

let activeIntervals = [];
let taskQueue = [];
let isProcessingQueue = false;

// Kısayolları hafızada tutacağımız değişken
let globalHotkeys = { enabled: false, start: null, stop: null };

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Hafızadaki Kısayolları Canlı Dinleme
chrome.storage.local.get(['hotkeys'], (res) => {
    if (res.hotkeys) globalHotkeys = res.hotkeys;
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes.hotkeys) globalHotkeys = changes.hotkeys.newValue;
        if (changes.isRunning !== undefined) isMacroRunning = changes.isRunning.newValue;
    }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'START_INSPECTION') {
        if (inspecting) return;
        inspecting = true;
        document.body.style.cursor = 'crosshair';

        const mouseOverHandler = (e) => { if (inspecting) { e.target.style.outline = '2px solid #6366f1'; e.target.style.backgroundColor = 'rgba(99, 102, 241, 0.1)'; } };
        const mouseOutHandler = (e) => { if (inspecting) { e.target.style.outline = ''; e.target.style.backgroundColor = ''; } };
        const clickHandler = (e) => {
            if (!inspecting) return;
            e.preventDefault(); e.stopPropagation();
            inspecting = false; document.body.style.cursor = 'default';
            e.target.style.outline = ''; e.target.style.backgroundColor = '';
            
            const selector = getCssSelector(e.target);
            chrome.storage.local.set({ savedSelector: selector }, () => {
                showPremiumToast("🎯 Hedef Seçici Başarıyla Kaydedildi!");
            });
            
            document.removeEventListener('click', clickHandler, true);
            document.removeEventListener('mouseover', mouseOverHandler, true);
            document.removeEventListener('mouseout', mouseOutHandler, true);
        };
        document.addEventListener('mouseover', mouseOverHandler, true);
        document.addEventListener('mouseout', mouseOutHandler, true);
        document.addEventListener('click', clickHandler, true);
    }

    if (request.action === 'START_PACKAGE_MACRO') {
        startMacroLogic(request.config.selector, request.config.actions);
    }

    if (request.action === 'STOP_MACRO') {
        stopMacroLogic();
    }
});

// ============================================================
// GLOBAL KISAYOL YAKALAYICI (Arayüz kapalıyken bile çalışır)
// ============================================================
document.addEventListener('keydown', (e) => {
    if (globalHotkeys && globalHotkeys.enabled) {
        
        // Durdurma Tuşu Kontrolü
        if (isMacroRunning && matchHotkey(e, globalHotkeys.stop)) {
            e.preventDefault();
            stopMacroLogic();
            showErrorToast(`🚨 Otomasyon Durduruldu! (${globalHotkeys.stop.display})`);
            return;
        }
        
        // Başlatma Tuşu Kontrolü
        if (!isMacroRunning && matchHotkey(e, globalHotkeys.start)) {
            e.preventDefault();
            startMacroFromStorage();
        }
    }
}, true);

// Tuş Eşleştirme Motoru
function matchHotkey(e, config) {
    if (!config || !config.key) return false;
    const mods = config.modifiers || { ctrl: false, shift: false, alt: false, meta: false };
    
    if (!!mods.ctrl !== e.ctrlKey) return false;
    if (!!mods.shift !== e.shiftKey) return false;
    if (!!mods.alt !== e.altKey) return false;
    if (!!mods.meta !== e.metaKey) return false;
    
    return e.key.toLowerCase() === config.key.toLowerCase();
}

// Hafızadan Veri Çekip Başlatma Fonksiyonu
function startMacroFromStorage() {
    chrome.storage.local.get(['savedPackages', 'selectedPackageId', 'savedSelector'], (res) => {
        if (!res.selectedPackageId || res.selectedPackageId === 'none' || !res.savedSelector) {
            showErrorToast("🚨 Başlatılamadı: Hedef veya Senaryo seçilmemiş!");
            return;
        }
        const pkg = (res.savedPackages || []).find(p => p.id == res.selectedPackageId);
        if (!pkg) return;
        
        const actionsForMacro = pkg.actions
          .filter(a => a.isActive !== false) 
          .map(a => ({
            text: a.text,
            isClick: a.isClick,
            delay: a.timeUnit === 's' ? (a.delay * 1000) : a.delay
          }));
          
        if (actionsForMacro.length === 0) {
            showErrorToast("🚨 Aktif eylem bulunamadı!");
            return;
        }

        chrome.storage.local.set({ isRunning: true });
        showPremiumToast(`🚀 Başlatıldı! (${globalHotkeys.start.display})`);
        startMacroLogic(res.savedSelector, actionsForMacro);
    });
}

function startMacroLogic(selector, actions) {
    isMacroRunning = false; 
    activeIntervals.forEach(clearInterval);
    activeIntervals = [];
    taskQueue = [];
    
    setTimeout(() => {
        isMacroRunning = true;
        console.log("🚀 Paket Döngüsü Başladı. Hedef:", selector);

        actions.forEach(action => {
            let delayMs = parseInt(action.delay) || 2000;
            taskQueue.push({ selector, text: action.text, isClick: action.isClick });

            let intervalId = setInterval(() => {
                if (isMacroRunning) {
                    taskQueue.push({ selector, text: action.text, isClick: action.isClick });
                    processQueue(); 
                }
            }, delayMs);

            activeIntervals.push(intervalId);
        });

        processQueue();
    }, 100);
}

function stopMacroLogic() {
    isMacroRunning = false;
    activeIntervals.forEach(clearInterval);
    activeIntervals = [];
    taskQueue = [];
    chrome.storage.local.set({ isRunning: false });
    console.log("🛑 Makro durduruldu.");
}

async function processQueue() {
    if (isProcessingQueue) return;
    isProcessingQueue = true;

    while (taskQueue.length > 0 && isMacroRunning) {
        let task = taskQueue.shift();
        await simulateHumanInteraction(task.selector, task.text, task.isClick);

        if (taskQueue.length > 0) {
            await sleep(1200);
        }
    }
    
    isProcessingQueue = false;
}

// ============================================================
// TOAST BİLDİRİM MOTORLARI
// ============================================================
function showPremiumToast(message) {
    const oldToast = document.getElementById('macro-premium-toast');
    if (oldToast) oldToast.remove();
    const toast = document.createElement('div');
    toast.id = 'macro-premium-toast';
    toast.innerHTML = `<div class="macro-toast-icon-circle" style="width: 28px; height: 28px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 2px solid rgba(16, 185, 129, 0.5);"><svg style="width: 16px; height: 16px; color: #10b981;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div><span>${message}</span>`;
    Object.assign(toast.style, { position: 'fixed', top: '24px', right: '24px', backgroundColor: '#020617', color: '#f8fafc', padding: '10px 20px', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 15px 15px -10px rgba(0, 0, 0, 0.3)', zIndex: '9999999', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid #10b981', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', transform: 'translateX(150%)', opacity: '0' });
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.transform = 'translateX(0)'; toast.style.opacity = '1'; }, 50);
    setTimeout(() => { toast.style.transform = 'translateX(150%)'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 3500);
}

function showErrorToast(message) {
    const oldToast = document.getElementById('macro-premium-toast');
    if (oldToast) oldToast.remove();
    const toast = document.createElement('div');
    toast.id = 'macro-premium-toast';
    toast.innerHTML = `<div class="macro-toast-icon-circle" style="width: 28px; height: 28px; border-radius: 50%; background-color: rgba(244, 63, 94, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 2px solid rgba(244, 63, 94, 0.5);"><svg style="width: 16px; height: 16px; color: #f43f5e;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg></div><span>${message}</span>`;
    Object.assign(toast.style, { position: 'fixed', top: '24px', right: '24px', backgroundColor: '#020617', color: '#f8fafc', padding: '10px 20px', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(244, 63, 94, 0.4), 0 15px 15px -10px rgba(0, 0, 0, 0.3)', zIndex: '9999999', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid #f43f5e', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', transform: 'translateX(150%)', opacity: '0' });
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.transform = 'translateX(0)'; toast.style.opacity = '1'; }, 50);
    setTimeout(() => { toast.style.transform = 'translateX(150%)'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 3500);
}

// ============================================================
// İNSAN SİMÜLASYONU
// ============================================================
async function simulateHumanInteraction(selector, messageText, isClickAction) {
    let targetElement = document.querySelector(selector);
    if (!targetElement) return console.error("Hata: Hedef bulunamadı!");

    const editableParent = targetElement.closest('[contenteditable="true"]');
    if (editableParent) targetElement = editableParent;

    if (isClickAction) {
        console.log("🎯 Element tıklanıyor...");
        targetElement.click();
        await sleep(150); 
    }

    if (messageText && messageText.trim() !== '') {
        targetElement.focus();
        
        if (targetElement.isContentEditable) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(targetElement);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        } else if (targetElement.value !== undefined) {
            targetElement.value = messageText; 
        }

        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', messageText);
        targetElement.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dataTransfer, bubbles: true, cancelable: true, composed: true }));
        targetElement.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        targetElement.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

        await sleep(150);

        const enterOptions = { bubbles: true, cancelable: true, composed: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 };
        targetElement.dispatchEvent(new KeyboardEvent('keydown', enterOptions));
        targetElement.dispatchEvent(new KeyboardEvent('keypress', enterOptions));
        targetElement.dispatchEvent(new KeyboardEvent('keyup', enterOptions));
        console.log("✉️ Gönderildi:", messageText);
    }

    chrome.storage.local.get(['totalActionsCount'], (res) => {
        let currentCount = res.totalActionsCount || 0;
        chrome.storage.local.set({ totalActionsCount: currentCount + 1 });
    });
}

function getCssSelector(el) {
    if (el.id) return `#${el.id}`;
    let path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();
        if (el.id) { selector = `#${el.id}`; path.unshift(selector); break; } 
        else if (el.className && typeof el.className === 'string') {
            const firstClass = el.className.split(' ')[0];
            if(firstClass && !firstClass.includes(':')) { selector += `.${firstClass}`; }
        }
        path.unshift(selector); el = el.parentNode;
        if(path.length > 3) break; 
    }
    return path.join(' > ');
}