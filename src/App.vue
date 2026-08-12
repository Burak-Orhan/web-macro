<template>
  <div class="relative w-96 bg-slate-50 text-slate-800 font-sans shadow-2xl flex flex-col h-[540px] overflow-hidden">
    
    <div class="bg-[#020617] text-white p-3.5 flex items-center justify-between shadow-md z-20 shrink-0">
      <div class="flex items-center gap-2.5">
        <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
        <h1 class="text-base font-bold tracking-wide">Web Otomasyon Aracı</h1>
      </div>
      <div v-if="isRunning" class="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider animate-pulse">
        <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0"></span> Çalışıyor
      </div>
    </div>
    
    <div v-if="currentView === 'home'" class="p-3.5 flex-1 flex flex-col space-y-3.5 overflow-y-auto custom-scrollbar relative z-10">
      
      <div class="grid grid-cols-2 gap-3 shrink-0">
        <div class="bg-white border border-slate-200 p-2.5 rounded-xl flex flex-col items-start justify-center shadow-sm relative overflow-hidden">
          <div v-if="isRunning" class="absolute inset-0 bg-emerald-50 opacity-50 animate-pulse"></div>
          <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 relative z-10">Sistem Durumu</span>
          <span :class="isRunning ? 'text-emerald-600' : 'text-slate-600'" class="text-[13px] font-extrabold flex items-center gap-1.5 relative z-10">
            <span v-if="isRunning" class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span v-else class="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
            {{ isRunning ? 'Aktif Döngü' : 'Beklemede' }}
          </span>
        </div>
        
        <div class="bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-xl flex flex-col relative shadow-sm">
          <div class="flex items-center justify-between w-full mb-0.5">
            <span class="text-[9px] text-indigo-500 font-bold uppercase tracking-wider">Gerçekleşen İşlem</span>
            <button @click="resetCounter" :disabled="totalActionsCount === 0" class="text-indigo-400 hover:text-indigo-600 disabled:opacity-30 transition-colors shrink-0 p-0.5" title="Sayacı Sıfırla">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.213 6H16"></path></svg>
            </button>
          </div>
          <span class="text-2xl font-black text-[#020617] leading-none">{{ totalActionsCount }}</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 shadow-sm shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded flex items-center justify-center shrink-0 transition-colors" :class="hotkeys.enabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"></path></svg>
            </div>
            <span class="text-[11px] font-bold tracking-wide transition-colors" :class="hotkeys.enabled ? 'text-[#020617]' : 'text-slate-400'">Klavye Kısayolları</span>
          </div>
          
          <button @click="toggleHotkeys" :disabled="isRunning" :class="hotkeys.enabled ? 'bg-indigo-500' : 'bg-slate-200'" class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50">
            <span :class="hotkeys.enabled ? 'translate-x-4' : 'translate-x-0'" class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out"></span>
          </button>
        </div>
        
        <div class="flex gap-2 transition-opacity duration-200" :class="!hotkeys.enabled ? 'opacity-40 pointer-events-none' : 'opacity-100'">
          <button @click="startRecordingHotkey('start')" :class="recordingType === 'start' ? 'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'" class="flex-1 border p-2 rounded-lg transition-all shadow-sm flex flex-col items-start gap-0.5 overflow-hidden">
            <span class="text-[9px] uppercase tracking-wider font-bold" :class="recordingType === 'start' ? 'text-emerald-600' : 'text-slate-400'">Başlat</span>
            <span class="text-[11px] font-black w-full text-left truncate" :class="recordingType === 'start' ? 'text-emerald-700' : 'text-[#020617]'">{{ recordingType === 'start' ? 'Dinleniyor...' : hotkeys.start.display }}</span>
          </button>
          
          <button @click="startRecordingHotkey('stop')" :class="recordingType === 'stop' ? 'ring-2 ring-rose-500 bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'" class="flex-1 border p-2 rounded-lg transition-all shadow-sm flex flex-col items-start gap-0.5 overflow-hidden">
            <span class="text-[9px] uppercase tracking-wider font-bold" :class="recordingType === 'stop' ? 'text-rose-600' : 'text-slate-400'">Durdur</span>
            <span class="text-[11px] font-black w-full text-left truncate" :class="recordingType === 'stop' ? 'text-rose-700' : 'text-[#020617]'">{{ recordingType === 'stop' ? 'Dinleniyor...' : hotkeys.stop.display }}</span>
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col shrink-0">
        
        <div class="p-3 border-b border-slate-100 bg-slate-50/50">
          <label class="flex items-center gap-1.5 mb-2">
            <span class="w-4 h-4 bg-slate-200 text-slate-600 rounded flex items-center justify-center text-[9px] font-black shrink-0">1</span>
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DOM Hedefi Belirle</span>
          </label>
          <div class="flex gap-2">
            <input v-model="targetSelector" type="text" readonly class="flex-1 min-w-0 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs bg-white text-slate-600 focus:outline-none focus:border-indigo-300 shadow-sm truncate" placeholder="Tıklama/Yazma hedefi seçin..." />
            <button @click="startInspection" :disabled="isRunning" class="bg-[#020617] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-sm shrink-0">Seç</button>
          </div>
        </div>

        <div class="p-3 flex flex-col">
          <div class="flex items-center justify-between mb-2.5">
            <label class="flex items-center gap-1.5">
              <span class="w-4 h-4 bg-slate-200 text-slate-600 rounded flex items-center justify-center text-[9px] font-black shrink-0">2</span>
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aktif Senaryo</span>
            </label>
            <button v-if="isRealPackageSelected" @click="openForm(selectedPackageId)" :disabled="isRunning" class="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50 transition-colors bg-indigo-50 px-2 py-1 rounded-md shrink-0">
              <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              Düzenle
            </button>
          </div>

          <div v-if="isRealPackageSelected" class="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm flex items-center justify-between group transition-all hover:border-indigo-200 hover:shadow-md">
            <div class="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
              <div class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div class="flex flex-col flex-1 min-w-0">
                <span class="text-[13px] font-bold text-[#020617] truncate">{{ selectedPackageName }}</span>
                <span class="text-[9px] font-medium text-slate-500 truncate mt-0.5">
                  {{ selectedPackageData?.actions?.length || 0 }} Döngü
                  <template v-if="passiveActionCount > 0">
                    <span class="text-slate-300 mx-0.5">|</span>
                    <span class="text-slate-400 font-bold">{{ passiveActionCount }} Pasif</span>
                  </template>
                </span>
              </div>
            </div>
            
            <button @click="showScenarioModal = true" :disabled="isRunning" class="ml-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all disabled:opacity-50 shrink-0">
              Değiştir
            </button>
          </div>

          <div v-else class="bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center flex-1 flex flex-col items-center justify-center p-3">
            <div class="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-100 mb-1.5 shrink-0">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <button @click="showScenarioModal = true" class="text-[11px] bg-white border border-slate-200 text-[#020617] px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100 transition-all shadow-sm">
              Senaryo Seç veya Yarat
            </button>
          </div>
          
        </div>
      </div>

      <button @click="toggleMacro" :disabled="!isRealPackageSelected || !targetSelector" :class="isRunning ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-[#020617] hover:bg-slate-800 shadow-slate-200'" class="w-full text-white py-3.5 rounded-xl font-extrabold transition-all shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 mt-auto">
        <svg v-if="!isRunning" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <svg v-else class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg>
        {{ isRunning ? 'Otomasyonu Durdur' : 'Otomasyonu Başlat' }}
      </button>
    </div>

    <div v-else-if="currentView === 'form'" class="p-4 flex-1 flex flex-col bg-white overflow-hidden">
      
      <div class="flex items-center justify-between mb-3 shrink-0">
        <h2 class="text-sm font-bold text-[#020617]">{{ formMode === 'create' ? 'Otomasyon Kurgula' : 'Senaryoyu Düzenle' }}</h2>
        <button v-if="formMode === 'edit'" @click="showDeleteModal = true" class="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded transition-colors shrink-0">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          Sil
        </button>
      </div>

      <div class="mb-4 shrink-0">
        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Senaryo Adı</label>
        <input v-model="packageForm.name" type="text" class="w-full border border-slate-200 p-2.5 rounded-lg text-sm font-semibold text-[#020617] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-sm" placeholder="Örn: Otomatik Form Doldurucu" />
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-3 mb-4 custom-scrollbar">
        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">İşlem Döngüsü</label>
        
        <div v-for="(action, index) in packageForm.actions" :key="index" 
             :class="action.isActive ? 'bg-white hover:border-slate-300 hover:shadow-md border-slate-200' : 'bg-slate-50 opacity-60 border-slate-200'"
             class="p-2.5 rounded-xl border shadow-sm relative group flex flex-col gap-2.5 transition-all">
          
          <div class="flex items-center justify-between">
            <span class="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider select-none shrink-0">
              #{{ index + 1 }}
            </span>
            
            <div class="flex items-center gap-2 shrink-0">
              <button @click="action.isActive = !action.isActive" :class="action.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'" class="flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold transition-all shadow-sm shrink-0" title="Adımı Aktif veya Pasif Yap">
                <span :class="action.isActive ? 'bg-emerald-500' : 'bg-slate-400'" class="w-1.5 h-1.5 rounded-full transition-colors shrink-0"></span>
                {{ action.isActive ? 'Aktif' : 'Pasif' }}
              </button>

              <div class="flex items-center bg-slate-100 rounded-md p-0.5 text-[10px] font-bold text-slate-500 border border-slate-200/50 shadow-inner shrink-0">
                <button @click="action.timeUnit = 'ms'" :class="action.timeUnit === 'ms' ? 'bg-white text-slate-800 shadow-sm rounded-sm' : 'hover:text-slate-700'" class="px-2 py-0.5 transition-all">ms</button>
                <button @click="action.timeUnit = 's'" :class="action.timeUnit === 's' ? 'bg-white text-slate-800 shadow-sm rounded-sm' : 'hover:text-slate-700'" class="px-2 py-0.5 transition-all">sn</button>
              </div>

              <div class="flex items-center bg-slate-50 border border-slate-200 rounded-md p-0.5 shrink-0">
                <button @click="moveActionUp(index)" :disabled="index === 0" class="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-colors rounded" title="Yukarı Taşı">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"></path></svg>
                </button>
                <div class="w-[1px] h-3 bg-slate-200 mx-0.5"></div>
                <button @click="moveActionDown(index)" :disabled="index === packageForm.actions.length - 1" class="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-colors rounded" title="Aşağı Taşı">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7 7"></path></svg>
                </button>
                <div class="w-[1px] h-3 bg-slate-200 mx-0.5"></div>
                <button @click="removeActionRow(index)" class="p-1 text-slate-400 hover:text-rose-500 transition-colors rounded" title="Aksiyonu Sil">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-stretch gap-2">
            <button @click="action.isClick = !action.isClick" :class="action.isClick ? 'bg-[#020617] text-white border-[#020617] shadow-inner' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-white hover:text-slate-600'" class="w-8 shrink-0 rounded-md border transition-all flex items-center justify-center" title="Tıklama event'i">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"></path></svg>
            </button>
            <input v-model="action.text" type="text" class="flex-1 min-w-0 border border-slate-200 px-2.5 py-1.5 rounded-md text-xs focus:border-[#020617] focus:outline-none transition-all shadow-sm font-medium" placeholder="Veri değeri veya metin..." />
            <div class="w-16 shrink-0 relative">
              <input v-model.number="action.delay" type="number" min="0" class="w-full border border-slate-200 px-1 py-1.5 rounded-md text-xs text-center font-bold focus:border-[#020617] focus:outline-none transition-all shadow-sm text-indigo-600" title="Zaman Miktarı" placeholder="Süre" />
            </div>
          </div>
        </div>

        <button @click="addActionRow" class="w-full border-2 border-dashed border-slate-200 text-slate-500 py-3 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-1 mt-1">
          + Yeni Aksiyon Ekle
        </button>
      </div>

      <div class="flex gap-2 pt-3 border-t border-slate-100 mt-auto shrink-0">
        <button v-if="macroPackages.length > 0" @click="handleCancelClick" class="flex-1 bg-white border border-slate-200 text-slate-600 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">İptal</button>
        <button @click="handleSaveButtonClick" class="flex-[2] bg-[#020617] text-white py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 shadow-md transition-all">
          {{ formMode === 'create' ? 'Senaryoyu Kaydet' : 'Değişiklikleri Güncelle' }}
        </button>
      </div>
    </div>

    <div v-if="showScenarioModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-16 px-4 animate-in fade-in duration-150">
      <div class="bg-white w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[400px] border border-slate-200/50 transform transition-all">
        
        <div class="p-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 shrink-0">
          <svg class="w-5 h-5 text-slate-400 shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input v-model="searchQuery" type="text" class="flex-1 min-w-0 bg-transparent border-none text-sm focus:ring-0 focus:outline-none font-medium text-slate-700 placeholder-slate-400" placeholder="Senaryo adı ara..." ref="searchInputRef" autofocus />
          <button @click="showScenarioModal = false" class="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div class="overflow-y-auto custom-scrollbar p-2 flex-1">
          <div v-if="filteredPackages.length === 0" class="py-6 text-center text-xs text-slate-400 font-medium">
            Aradığınız senaryo bulunamadı.
          </div>
          
          <div v-else class="space-y-1">
            <button 
              v-for="pkg in filteredPackages" :key="pkg.id" 
              @click="selectScenarioItem(pkg.id)"
              class="w-full flex items-center justify-between p-3 rounded-xl transition-all text-left"
              :class="selectedPackageId === pkg.id ? 'bg-indigo-50 border border-indigo-100' : 'bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200'"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="selectedPackageId === pkg.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                </div>
                <div class="flex flex-col flex-1 min-w-0">
                  <span class="text-xs font-bold text-slate-800 truncate" :class="selectedPackageId === pkg.id ? 'text-indigo-900' : ''">{{ pkg.name }}</span>
                  <span class="text-[10px] text-slate-500">{{ pkg.actions?.length || 0 }} Aksiyon</span>
                </div>
              </div>
              <svg v-if="selectedPackageId === pkg.id" class="w-4 h-4 text-indigo-500 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </button>
          </div>
        </div>

        <div class="p-2 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <button @click="selectScenarioItem('trigger_create')" class="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#020617] hover:bg-slate-100 transition-colors shadow-sm">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
            Yeni Senaryo Oluştur
          </button>
        </div>
      </div>
    </div>

    <div v-if="showCancelModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-6">
      <div class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 duration-150">
        <div class="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4 shrink-0">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h3 class="text-base font-extrabold text-[#020617] mb-2 text-center">İptal Etmek İstiyor musunuz?</h3>
        <p class="text-xs text-slate-500 mb-6 text-center leading-relaxed">
          Kaydedilmemiş değişiklikleriniz kalıcı olarak silinecektir. Devam etmek istiyor musunuz?
        </p>
        <div class="flex flex-col gap-2">
          <button @click="confirmCancel" class="w-full bg-amber-500 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-amber-600 shadow-md transition-all">Evet, İptal Et</button>
          <button @click="showCancelModal = false" class="w-full bg-slate-100 text-slate-700 py-2.5 rounded-lg font-bold text-xs hover:bg-slate-200 transition-all">Düzenlemeye Dön</button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-6">
      <div class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 duration-150">
        <div class="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 shrink-0">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </div>
        <h3 class="text-base font-extrabold text-[#020617] mb-2 text-center">Senaryoyu Sil</h3>
        <p class="text-xs text-slate-500 mb-6 text-center leading-relaxed">
          <span class="font-semibold text-slate-700">"{{ packageForm.name }}"</span> verisi tamamen silinecek. Bu işlemi geri alamazsınız.
        </p>
        <div class="flex flex-col gap-2">
          <button @click="confirmDelete" class="w-full bg-rose-600 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-rose-700 shadow-md transition-all">Kalıcı Olarak Sil</button>
          <button @click="showDeleteModal = false" class="w-full bg-slate-100 text-slate-700 py-2.5 rounded-lg font-bold text-xs hover:bg-slate-200 transition-all">İptal Et</button>
        </div>
      </div>
    </div>

    <div v-if="showUpdateModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-6">
      <div class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 duration-150">
        <div class="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 shrink-0">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
        </div>
        <h3 class="text-base font-extrabold text-[#020617] mb-2 text-center">İşlemi Onayla</h3>
        <p class="text-xs text-slate-500 mb-6 text-center leading-relaxed">
          <span class="font-semibold text-slate-700">"{{ packageForm.name }}"</span> konfigürasyonu değiştirilecek. Onaylıyor musunuz?
        </p>
        <div class="flex flex-col gap-2">
          <button @click="confirmUpdate" class="w-full bg-[#020617] text-white py-2.5 rounded-lg font-bold text-xs hover:bg-slate-800 shadow-md transition-all">Değişiklikleri Uygula</button>
          <button @click="showUpdateModal = false" class="w-full bg-slate-100 text-slate-700 py-2.5 rounded-lg font-bold text-xs hover:bg-slate-200 transition-all">Düzenlemeye Dön</button>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const currentView = ref('home')
const formMode = ref('create')
const editingPackageId = ref(null)

const showDeleteModal = ref(false)
const showUpdateModal = ref(false)
const showCancelModal = ref(false)
const showScenarioModal = ref(false)

const searchQuery = ref('')
const searchInputRef = ref(null)

const macroPackages = ref([])
const targetSelector = ref('')
const selectedPackageId = ref('none')
const isRunning = ref(false)
const totalActionsCount = ref(0)

const hotkeys = ref({ 
  enabled: false, 
  start: { key: 'F2', modifiers: { ctrl: false, shift: false, alt: false, meta: false }, display: 'F2' },
  stop: { key: 'Escape', modifiers: { ctrl: false, shift: false, alt: false, meta: false }, display: 'ESC' }
})
const recordingType = ref(null) 

const packageForm = ref({ name: '', actions: [ { text: '', delay: 2000, timeUnit: 'ms', isClick: false, isActive: true } ] })

const isRealPackageSelected = computed(() => {
  return selectedPackageId.value !== 'none' && selectedPackageId.value !== 'trigger_create' && selectedPackageId.value !== ''
})

const selectedPackageData = computed(() => {
  return macroPackages.value.find(p => p.id == selectedPackageId.value)
})

const selectedPackageName = computed(() => {
  if (!isRealPackageSelected.value) return '-- Seçilmedi (Boş) --'
  return selectedPackageData.value ? selectedPackageData.value.name : '-- Seçilmedi (Boş) --'
})

const passiveActionCount = computed(() => {
  if (!selectedPackageData.value || !selectedPackageData.value.actions) return 0;
  return selectedPackageData.value.actions.filter(a => a.isActive === false).length;
})

const filteredPackages = computed(() => {
  if (!searchQuery.value) return macroPackages.value
  return macroPackages.value.filter(pkg => 
    pkg.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const storageListener = (changes, namespace) => {
  if (namespace === 'local') {
    if (changes.totalActionsCount) totalActionsCount.value = changes.totalActionsCount.newValue || 0;
    if (changes.isRunning !== undefined) isRunning.value = changes.isRunning.newValue || false;
  }
}

onMounted(() => {
  if (chrome?.storage) {
    chrome.storage.local.get(['savedPackages', 'savedSelector', 'selectedPackageId', 'isRunning', 'totalActionsCount', 'hotkeys'], (result) => {
      if (result.savedPackages && Array.isArray(result.savedPackages) && result.savedPackages.length > 0) {
        macroPackages.value = result.savedPackages
        if (result.selectedPackageId) selectedPackageId.value = result.selectedPackageId.toString()
        else selectedPackageId.value = 'none'
      } else {
        macroPackages.value = []
        selectedPackageId.value = 'none'
        openForm() 
      }
      if (result.savedSelector) targetSelector.value = result.savedSelector
      if (result.isRunning !== undefined) isRunning.value = result.isRunning
      if (result.totalActionsCount) totalActionsCount.value = result.totalActionsCount
      
      if (result.hotkeys && result.hotkeys.start && result.hotkeys.stop) {
        hotkeys.value = result.hotkeys;
      }
    })
    
    chrome.storage.onChanged.addListener(storageListener);
  }
})

onUnmounted(() => {
  if (chrome?.storage) {
    chrome.storage.onChanged.removeListener(storageListener);
  }
  window.removeEventListener('keydown', captureHotkey, { capture: true })
})

const resetCounter = () => {
  totalActionsCount.value = 0;
  if (chrome?.storage) chrome.storage.local.set({ totalActionsCount: 0 });
}

const toggleHotkeys = () => {
  hotkeys.value.enabled = !hotkeys.value.enabled;
  saveGlobalConfig();
}

const startRecordingHotkey = (type) => {
  recordingType.value = type;
  window.addEventListener('keydown', captureHotkey, { capture: true });
}

const captureHotkey = (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  const modifiers = {
    ctrl: e.ctrlKey,
    shift: e.shiftKey,
    alt: e.altKey,
    meta: e.metaKey
  };

  const invalidKeys = ['Control', 'Shift', 'Alt', 'Meta', 'AltGraph', 'CapsLock', 'Tab'];
  if (invalidKeys.includes(e.key)) return; 

  if (e.key === 'Escape' && !modifiers.ctrl && !modifiers.shift && !modifiers.alt && !modifiers.meta) {
    recordingType.value = null;
    window.removeEventListener('keydown', captureHotkey, { capture: true });
    return;
  }

  let displayArr = [];
  if(modifiers.ctrl) displayArr.push('Ctrl');
  if(modifiers.shift) displayArr.push('Shift');
  if(modifiers.alt) displayArr.push('Alt');
  if(modifiers.meta) displayArr.push('Cmd/Win');

  let mainKey = e.key.toUpperCase();
  if (mainKey === ' ') mainKey = 'SPACE';
  displayArr.push(mainKey);

  if (recordingType.value === 'start') {
    hotkeys.value.start = { key: e.key, modifiers: modifiers, display: displayArr.join(' + ') };
  } else if (recordingType.value === 'stop') {
    hotkeys.value.stop = { key: e.key, modifiers: modifiers, display: displayArr.join(' + ') };
  }

  hotkeys.value.enabled = true;
  recordingType.value = null;
  saveGlobalConfig();
  
  window.removeEventListener('keydown', captureHotkey, { capture: true });
}

const saveGlobalConfig = () => {
  if (chrome?.storage) {
    chrome.storage.local.set({ hotkeys: JSON.parse(JSON.stringify(hotkeys.value)) });
  }
}

const selectScenarioItem = (id) => {
  if (id !== selectedPackageId.value && id !== 'trigger_create') {
    resetCounter();
  }

  showScenarioModal.value = false;
  searchQuery.value = '';

  if (id === 'trigger_create') {
    selectedPackageId.value = 'none'
    openForm()
  } else {
    selectedPackageId.value = id
  }
}

const openForm = (pkgId = null) => {
  showDeleteModal.value = false
  showUpdateModal.value = false
  showCancelModal.value = false
  showScenarioModal.value = false
  searchQuery.value = ''

  if (pkgId) {
    const existingPkg = macroPackages.value.find(p => p.id == pkgId)
    if (existingPkg) {
      const pkgCopy = JSON.parse(JSON.stringify(existingPkg))
      pkgCopy.actions.forEach(a => {
        if (!a.timeUnit) a.timeUnit = 'ms' 
        if (a.isActive === undefined) a.isActive = true
      })
      packageForm.value = pkgCopy
      formMode.value = 'edit'
      editingPackageId.value = pkgId
    }
  } else {
    packageForm.value = { name: '', actions: [ { text: '', delay: 2000, timeUnit: 'ms', isClick: false, isActive: true } ] }
    formMode.value = 'create'
    editingPackageId.value = null
  }
  currentView.value = 'form'
}

const handleCancelClick = () => {
  showCancelModal.value = true
}

const confirmCancel = () => {
  showCancelModal.value = false
  currentView.value = 'home'
}

const addActionRow = () => packageForm.value.actions.push({ text: '', delay: 2000, timeUnit: 'ms', isClick: false, isActive: true })

const removeActionRow = (index) => {
  if (packageForm.value.actions.length > 1) packageForm.value.actions.splice(index, 1)
}

const moveActionUp = (index) => {
  if (index > 0) {
    const temp = packageForm.value.actions[index];
    packageForm.value.actions[index] = packageForm.value.actions[index - 1];
    packageForm.value.actions[index - 1] = temp;
  }
}

const moveActionDown = (index) => {
  if (index < packageForm.value.actions.length - 1) {
    const temp = packageForm.value.actions[index];
    packageForm.value.actions[index] = packageForm.value.actions[index + 1];
    packageForm.value.actions[index + 1] = temp;
  }
}

const handleSaveButtonClick = () => {
  if (!packageForm.value.name.trim()) return alert("Lütfen senaryoya bir isim verin.")
  const validActions = packageForm.value.actions.filter(a => a.text.trim() !== '' || a.isClick)
  if (validActions.length === 0) return alert("En az bir işlem tanımlamalısınız.")

  if (formMode.value === 'edit') {
    showUpdateModal.value = true
  } else {
    executeSave(validActions)
  }
}

const confirmUpdate = () => {
  const validActions = packageForm.value.actions.filter(a => a.text.trim() !== '' || a.isClick)
  executeSave(validActions)
  showUpdateModal.value = false
}

const executeSave = (validActions) => {
  const packageDataToSave = {
    id: formMode.value === 'edit' ? editingPackageId.value : Date.now().toString(),
    name: packageForm.value.name,
    actions: validActions
  }

  if (formMode.value === 'create') {
    macroPackages.value.push(packageDataToSave)
  } else {
    const index = macroPackages.value.findIndex(p => p.id == editingPackageId.value)
    if (index !== -1) macroPackages.value[index] = packageDataToSave
  }
  
  saveToChromeStorage()
  selectedPackageId.value = packageDataToSave.id
  currentView.value = 'home'
}

const confirmDelete = () => {
  macroPackages.value = macroPackages.value.filter(p => p.id != editingPackageId.value)
  saveToChromeStorage()
  showDeleteModal.value = false
  
  if (macroPackages.value.length === 0) {
    selectedPackageId.value = 'none'
    openForm()
  } else {
    selectedPackageId.value = 'none'
    currentView.value = 'home'
  }
}

const saveToChromeStorage = () => {
  if (chrome?.storage) {
    const rawData = JSON.parse(JSON.stringify(macroPackages.value))
    chrome.storage.local.set({ savedPackages: rawData })
  }
}

const startInspection = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab) {
     chrome.tabs.sendMessage(tab.id, { action: 'START_INSPECTION' })
     window.close()
  }
}

const toggleMacro = async () => {
  if (!isRealPackageSelected.value || !targetSelector.value) return alert("Lütfen hedef element ve otomasyon senaryosu seçin.")
  if (!selectedPackageData.value) return alert("Hata: Senaryo verisi okunamadı!")

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab) return

  if (!isRunning.value) {
    const actionsForMacro = selectedPackageData.value.actions
      .filter(a => a.isActive !== false) 
      .map(a => ({
        text: a.text,
        isClick: a.isClick,
        delay: a.timeUnit === 's' ? (a.delay * 1000) : a.delay
      }))

    if (actionsForMacro.length === 0) {
       return alert("Bu senaryodaki tüm eylemler pasif durumda. Lütfen en az bir eylemi aktif yapın.");
    }

    isRunning.value = true
    chrome.storage.local.set({ selectedPackageId: selectedPackageId.value, isRunning: true })
    
    chrome.tabs.sendMessage(tab.id, { 
      action: 'START_PACKAGE_MACRO', 
      config: { 
        selector: targetSelector.value, 
        actions: actionsForMacro,
        hotkey: hotkeys.value 
      } 
    })
  } else {
    isRunning.value = false
    chrome.storage.local.set({ isRunning: false })
    chrome.tabs.sendMessage(tab.id, { action: 'STOP_MACRO' })
  }
}
</script>

<style>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>