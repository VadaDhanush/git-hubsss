import { useState, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SK = 'dj_tracker_rn_v1';

const DEF = {
  profile: { name:'Dhanush Jaddu', goal_study:6, goal_water:8, goal_steps:8000, goal_weight:70, goal_budget:500 },
  logs: {}
};

export const getTK = () => new Date().toISOString().split('T')[0];

export const blank = () => ({
  weight:'', water:0, mood:'', steps:'',
  sleep:{ bed:'', wake:'', tBed:'22:30', tWake:'06:00', quality:'' },
  sessions:[],
  meals:{ breakfast:'', lunch:'', dinner:'', snacks:'' },
  macros:{ cal:'', pro:'', carb:'', fat:'' },
  workouts:[],
  habits:{ meditation:false, reading:false, no_junk:false, walk:false },
  expenses:[],
  notes:''
});

export function useStore() {
  const [data, setData] = useState(DEF);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(data);
  ref.current = data;

  // Load on mount
  useEffect(() => {
    AsyncStorage.getItem(SK).then(r => {
      if (r) setData(JSON.parse(r));
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const save = useCallback(async n => {
    setData(n);
    await AsyncStorage.setItem(SK, JSON.stringify(n));
  }, []);

  const log = (loaded ? data : DEF).logs[getTK()] || blank();

  const upLog = useCallback(patch => {
    const k   = getTK();
    const cur = ref.current;
    save({ ...cur, logs: { ...cur.logs, [k]: { ...(cur.logs[k] || blank()), ...patch } } });
  }, [save]);

  return { data, log, upLog, loaded };
}
