const days = [
  {key:'mon',short:'MON',label:'MONDAY',tag:'MONDAY // FRIDAY',title:'UPPER BODY // PULL FOCUS',note:'⚠️ Pull-up: if you cannot hit the target reps yet, leave about 1–2 reps in reserve on each set. Use AMRAP only on the final set.',items:[['Pull-up','8 · 7 · 6 · 5 · AMRAP','Bodyweight'],['Push-up','20 · 20 · 15 · AMRAP','Bodyweight'],['Barbell Row','10 · 10 · 10 · 10','26 kg'],['Dumbbell Lateral Raise','15 · 15 · 15 · 15','5 kg'],['Hanging Knee Raise','15 · 15 · 15','Core']]},
  {key:'tue',short:'TUE',label:'TUESDAY',tag:'TUESDAY // THURSDAY',title:'ACTIVE RECOVERY // CARDIO',note:'30-minute cardio: brisk walk or run. Keep light pull-ups at 50–60% of your maximum reps — never train to failure.',items:[['Cardio','30 minutes','Brisk walk / run'],['Light pull-up','3 × 50–60% max','Do not train to failure'],['Plank','60 seconds · 60 seconds · 60 seconds','Core']]},
  {key:'wed',short:'WED',label:'WEDNESDAY',tag:'WEDNESDAY',title:'LOWER BODY // CONTROL',note:'Focus on range of motion and control. Rest for the full 2 minutes on Squat and Romanian Deadlift.',items:[['Chin-up','8 · 7 · 6 · 5 · AMRAP','Bodyweight'],['Squat','12 · 12 · 12 · 12','26 kg'],['Romanian Deadlift','10 · 10 · 10 · 10','Barbell'],['One-arm Dumbbell Row','12 each arm · 12 each arm · 12 each arm','10 kg'],['Plank','60 seconds × 3','Core']]},
  {key:'thu',short:'THU',label:'THURSDAY',tag:'TUESDAY // THURSDAY',title:'ACTIVE RECOVERY // CARDIO',note:'Active recovery day. Keep a steady pace, use clean technique, and save energy for conditioning.',items:[['Cardio','30 minutes','Brisk walk / run'],['Light pull-up','3 × 50–60% max','Do not train to failure'],['Plank','60 seconds · 60 seconds · 60 seconds','Core']]},
  {key:'fri',short:'FRI',label:'FRIDAY',tag:'MONDAY // FRIDAY',title:'UPPER BODY // PULL FOCUS',note:'⚠️ Pull-up: if you cannot hit the target reps yet, leave about 1–2 reps in reserve on each set. Use AMRAP only on the final set.',items:[['Pull-up','8 · 7 · 6 · 5 · AMRAP','Bodyweight'],['Push-up','20 · 20 · 15 · AMRAP','Bodyweight'],['Barbell Row','10 · 10 · 10 · 10','26 kg'],['Dumbbell Lateral Raise','15 · 15 · 15 · 15','5 kg'],['Hanging Knee Raise','15 · 15 · 15','Core']]},
  {key:'sat',short:'SAT',label:'SATURDAY',tag:'SATURDAY // CONDITIONING',title:'CONDITIONING // 5 ROUNDS',note:'Complete 5 rounds: Pull-up × 5 → Push-up × 15 → Squat × 20. Rest 90 seconds, then repeat.',items:[['Pull-up','5 × 5 rounds','Bodyweight'],['Push-up','15 × 5 rounds','Bodyweight'],['Squat','20 × 5 rounds','Bodyweight']]},
  {key:'sun',short:'SUN',label:'SUNDAY',tag:'REST // RECOVERY',title:'REST DAY // RESET SYSTEM',note:'Full rest day. Take an easy walk, stretch, hydrate, and prepare for the next week.',items:[['Recovery walk','20–30 minutes','Optional'],['Mobility','10 minutes','Optional'],['Full rest','Rest','Required']]}
];

const restSeconds = {'Pull-up':120,'Push-up':90,'Barbell Row':90,'Dumbbell Lateral Raise':60,'Hanging Knee Raise':45,'Chin-up':120,'Squat':120,'Romanian Deadlift':120,'One-arm Dumbbell Row':90,'Plank':45,'Light pull-up':120,'Cardio':0,'Recovery walk':0,'Mobility':0,'Full rest':0};
const state = JSON.parse(localStorage.getItem('spidey-tracker-state') || '{}');
let current = state.current || 'mon';
let activeTimer = null;
let calendarView = new Date();
const $ = selector => document.querySelector(selector);
const day = () => days.find(item => item.key === current);
const formatTime = total => `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`;
function save(){localStorage.setItem('spidey-tracker-state', JSON.stringify(state));}

function dateKey(year, month, date){return `${year}-${String(month + 1).padStart(2,'0')}-${String(date).padStart(2,'0')}`;}
function renderCalendar(){
  const year = calendarView.getFullYear();
  const month = calendarView.getMonth();
  $('#monthLabel').textContent = new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(calendarView).toUpperCase();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const today = new Date();
  const cells = [];
  for(let index = 0; index < 42; index++){
    const dayNumber = index - firstDay + 1;
    const inCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
    const actualDate = inCurrentMonth ? dayNumber : dayNumber <= 0 ? previousMonthDays + dayNumber : dayNumber - daysInMonth;
    const actualMonth = inCurrentMonth ? month : dayNumber <= 0 ? month - 1 : month + 1;
    const actualYear = new Date(year, actualMonth, 1).getFullYear();
    const actualMonthNormalized = new Date(year, actualMonth, 1).getMonth();
    const key = dateKey(actualYear, actualMonthNormalized, actualDate);
    const isToday = key === dateKey(today.getFullYear(), today.getMonth(), today.getDate());
    const completed = state.calendar?.[key];
    cells.push(`<button class="calendar-day ${inCurrentMonth ? '' : 'outside'} ${isToday ? 'today' : ''} ${completed ? 'trained' : ''}" data-date="${key}" aria-label="${key} ${completed ? 'completed' : 'not completed'}"><span>${actualDate}</span>${completed ? '<b>✓</b>' : ''}</button>`);
  }
  $('#calendarGrid').innerHTML = cells.join('');
  $('#calendarGrid').querySelectorAll('.calendar-day').forEach(button => button.onclick = () => { state.calendar ??= {}; state.calendar[button.dataset.date] = !state.calendar[button.dataset.date]; save(); renderCalendar(); });
}
function playRestAlert(){
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if(!AudioContext) return;
  const audio = new AudioContext();
  const now = audio.currentTime;
  [0, .12, .24].forEach((offset, index) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(index === 0 ? 360 : index === 1 ? 560 : 820, now + offset);
    oscillator.frequency.exponentialRampToValueAtTime(index === 0 ? 540 : index === 1 ? 840 : 1160, now + offset + .08);
    gain.gain.setValueAtTime(.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(.28, now + offset + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, now + offset + .28);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(now + offset);
    oscillator.stop(now + offset + .18);
  });
  setTimeout(() => audio.close(), 700);
}
function showRestToast(name){
  $('#toastMessage').textContent = `${name} rest is complete. Your next set is ready.`;
  $('#restToast').classList.add('visible');
  playRestAlert();
  clearTimeout(window.restToastTimeout);
  window.restToastTimeout = setTimeout(() => $('#restToast').classList.remove('visible'), 6000);
}

function renderRail(){
  const rail = $('#dayRail');
  rail.innerHTML = days.map(d => `<button class="day-btn ${d.key === current ? 'active' : ''} ${state[d.key]?.every(Boolean) ? 'complete' : ''}" data-day="${d.key}">${d.short}<small>${d.label}</small></button>`).join('');
  rail.querySelectorAll('button').forEach(button => button.onclick = () => { current = button.dataset.day; state.current = current; save(); render(); });
}

function render(){
  const d = day();
  renderRail();
  $('#dayTag').textContent = d.tag;
  $('#dayTitle').textContent = d.title;
  $('#sessionNote').textContent = d.note;
  const checks = state[d.key] || [];
  $('#workoutGrid').innerHTML = d.items.map((item, index) => `<article class="exercise-card ${checks[index] ? 'done' : ''}"><div class="exercise-head"><div><span class="exercise-num">0${index + 1} / ${String(d.items.length).padStart(2,'0')}</span><h4>${item[0]}</h4><span class="load">${item[2]}</span></div><span class="exercise-num">${checks[index] ? '✓' : '○'}</span></div><div class="sets">${item[1].split(' · ').map((set, setIndex) => `<span class="set ${set.toLowerCase().includes('amrap') ? 'amrap' : ''}"><small>${setIndex + 1}</small>${set}</span>`).join('')}</div><button class="complete-btn" data-i="${index}">${checks[index] ? 'MARK AS INCOMPLETE' : 'MARK COMPLETE'}</button></article>`).join('');
  $('#workoutGrid').querySelectorAll('.exercise-card').forEach((card, index) => {
    const name = d.items[index][0];
    const seconds = restSeconds[name] || 0;
    card.querySelectorAll('.set').forEach((set, setIndex) => {
      set.dataset.set = setIndex;
      if(state.sets?.[d.key]?.[index]?.[setIndex]) set.classList.add('set-done');
      set.onclick = () => {
        state.sets ??= {};
        state.sets[d.key] ??= {};
        state.sets[d.key][index] ??= [];
        state.sets[d.key][index][setIndex] = !state.sets[d.key][index][setIndex];
        save();
        render();
      };
    });
    const rest = document.createElement('div');
    rest.className = 'exercise-rest';
    rest.innerHTML = `<span>REST</span><strong>${seconds ? formatTime(seconds) : '—'}</strong><button class="rest-btn" ${seconds ? '' : 'disabled'}>${seconds ? 'START REST' : 'NO REST'}</button>`;
    card.insertBefore(rest, card.querySelector('.complete-btn'));
    if(seconds) rest.querySelector('.rest-btn').onclick = () => startRest(rest.querySelector('.rest-btn'), seconds, name);
  });
  $('#workoutGrid').querySelectorAll('.complete-btn').forEach(button => button.onclick = () => { const index = +button.dataset.i; state[d.key] ??= []; state[d.key][index] = !state[d.key][index]; save(); render(); });
  updateProgress();
}

function updateProgress(){
  let total = 0, done = 0;
  days.forEach(d => d.items.forEach((_, index) => { total++; if(state[d.key]?.[index]) done++; }));
  $('#progressLabel').textContent = `${done} / ${total} COMPLETED`;
  $('#progressBar').style.width = `${total ? done / total * 100 : 0}%`;
}

function startRest(button, initialSeconds, name){
  if(activeTimer?.button === button){ activeTimer.running = !activeTimer.running; button.textContent = activeTimer.running ? 'PAUSE' : 'RESUME'; return; }
  if(activeTimer) activeTimer.button.textContent = 'START REST';
  activeTimer = {button, seconds: initialSeconds, running: true, name};
  button.textContent = formatTime(activeTimer.seconds);
  tickRest();
}
function tickRest(){
  if(!activeTimer || !activeTimer.running) return;
  activeTimer.button.textContent = formatTime(activeTimer.seconds);
  if(activeTimer.seconds <= 0){ const finishedName = activeTimer.name; activeTimer.button.textContent = 'DONE'; activeTimer.button.classList.add('finished'); activeTimer = null; showRestToast(finishedName); return; }
  activeTimer.seconds--;
  setTimeout(tickRest, 1000);
}

$('#resetDay').onclick = () => { if(confirm('Reset all progress for this day?')){ delete state[current]; if(state.sets) delete state.sets[current]; save(); render(); } };
$('#dismissToast').onclick = () => $('#restToast').classList.remove('visible');
const rest = [['PULL-UP','02:00'],['PUSH-UP','01:30'],['BARBELL ROW','01:30'],['SQUAT / RDL','02:00'],['LATERAL RAISE','01:00'],['CORE','00:45–01:00']];
$('#restGrid').innerHTML = rest.map(item => `<div class="rest-item"><strong>${item[0]}</strong><span>${item[1]}</span></div>`).join('');
$('#prevMonth').onclick = () => { calendarView = new Date(calendarView.getFullYear(), calendarView.getMonth() - 1, 1); renderCalendar(); };
$('#nextMonth').onclick = () => { calendarView = new Date(calendarView.getFullYear(), calendarView.getMonth() + 1, 1); renderCalendar(); };
setInterval(() => { $('#clock').textContent = new Date().toLocaleTimeString('en-GB'); }, 1000);
render();
renderCalendar();
