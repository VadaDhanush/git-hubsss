import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Animated, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Polyline, Circle, Line } from 'react-native-svg';

import { darkT, TAB_COLORS } from './src/theme/colors';
import { useStore } from './src/hooks/useStore';
import HomeScreen    from './src/screens/HomeScreen';
import ExpenseScreen from './src/screens/ExpenseScreen';
import GymScreen     from './src/screens/GymScreen';
import DietScreen    from './src/screens/DietScreen';
import HabitsScreen  from './src/screens/HabitsScreen';

const Tab = createBottomTabNavigator();
const T = darkT;

// ── Nav icons ─────────────────────────────────────────────────
function HomeIc({c,s})  { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><Polyline points="9 22 9 12 15 12 15 22"/></Svg>; }
function WalletIc({c,s}){ return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><Rect x="2" y="5" width="20" height="15" rx="2"/><Path d="M16 10h4v4h-4z"/><Line x1="2" y1="10" x2="22" y2="10"/></Svg>; }
function GymIc({c,s})   { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><Path d="M6 5v14M18 5v14M4 7h4M16 7h4M4 17h4M16 17h4M2 10h4M18 10h4M2 14h4M18 14h4"/></Svg>; }
function FoodIc({c,s})  { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><Path d="M12 2a7 7 0 017 7c0 3.87-3.13 7-7 7S5 12.87 5 9a7 7 0 017-7z"/><Path d="M12 16v6M9 19h6"/></Svg>; }
function CheckIc({c,s}) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><Rect x="3" y="3" width="7" height="7" rx="1"/><Rect x="14" y="3" width="7" height="7" rx="1"/><Rect x="3" y="14" width="7" height="7" rx="1"/><Polyline points="14 18 16 20 20 15"/></Svg>; }

// ── Header (dark only, no toggle) ────────────────────────────
function AppHeader() {
  const insets = useSafeAreaInsets();
  const today  = new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  return (
    <View style={{
      backgroundColor: T.hdrGradFrom,
      paddingTop: insets.top + 8,
      paddingBottom: 14,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: T.glassBd,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    }}>
      <View>
        <View style={{ flexDirection:'row', alignItems:'center', gap:5, marginBottom:3 }}>
          <View style={{ width:6, height:6, borderRadius:3, backgroundColor:T.green }}/>
          <Text style={{ fontSize:9, fontWeight:'700', color:T.green, letterSpacing:1.4 }}>LIVE</Text>
        </View>
        <View style={{ flexDirection:'row', alignItems:'baseline' }}>
          <Text style={{ fontSize:18, fontWeight:'800', color:T.accent, letterSpacing:-0.3 }}>DJ'</Text>
          <Text style={{ fontSize:18, fontWeight:'800', color:T.text, letterSpacing:-0.3 }}>Tracker</Text>
        </View>
        <Text style={{ fontSize:10, color:T.dim, marginTop:2 }}>{today}</Text>
      </View>
    </View>
  );
}

// ── Animated Tab Icon ─────────────────────────────────────────
function AnimatedTabIcon({ Ic, col, focused, s }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.spring(scale, { toValue:1.2, friction:3, tension:120, useNativeDriver:true }),
        Animated.spring(scale, { toValue:1, friction:5, tension:80, useNativeDriver:true }),
      ]).start();
    }
  }, [focused]);

  return (
    <Animated.View style={{ padding:6, borderRadius:12,
      backgroundColor: focused ? `${col}18` : 'transparent',
      transform: [{ scale }],
    }}>
      <Ic c={col} s={s}/>
    </Animated.View>
  );
}

// ── Color-Coded Tab Bar ──────────────────────────────────────
function AppTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const ICONS  = [HomeIc, WalletIc, GymIc, FoodIc, CheckIc];
  const LABELS = ['Home','Expenses','Gym','Diet','Habits'];
  const COLORS = [TAB_COLORS.Home, TAB_COLORS.Expenses, TAB_COLORS.Gym, TAB_COLORS.Diet, TAB_COLORS.Habits];
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: T.hdrGradFrom,
      borderTopWidth: 1,
      borderTopColor: T.glassBd,
      paddingTop: 10,
      paddingBottom: insets.bottom + 8,
    }}>
      {state.routes.map((route, idx) => {
        const focused = state.index === idx;
        const Ic = ICONS[idx];
        const tabCol = COLORS[idx];
        const col = focused ? tabCol : T.dim;
        return (
          <TouchableOpacity key={route.key} onPress={() => navigation.navigate(route.name)}
            style={{ flex:1, alignItems:'center', gap:4 }}>
            <AnimatedTabIcon Ic={Ic} col={col} focused={focused} s={20}/>
            <Text style={{ fontSize:10, fontWeight:focused?'700':'400', color:col, letterSpacing:0.3 }}>{LABELS[idx]}</Text>
            {focused && <View style={{ width:4, height:4, borderRadius:2, backgroundColor:tabCol, marginTop:1 }}/>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Particle (for splash screen) ─────────────────────────────
function Particle({ x, y, size, delay }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue:0.4, duration:1200, useNativeDriver:true }),
          Animated.timing(translateY, { toValue:-40, duration:2400, useNativeDriver:true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue:0, duration:1200, useNativeDriver:true }),
          Animated.timing(translateY, { toValue:0, duration:0, useNativeDriver:true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={{
      position:'absolute', left:x, top:y,
      width:size, height:size, borderRadius:size/2,
      backgroundColor: T.accent,
      opacity, transform:[{ translateY }],
    }}/>
  );
}

// ── Splash Screen (with particles) ───────────────────────────
function SplashScreen({ onFinish }) {
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const scaleAnim   = useRef(new Animated.Value(0.8)).current;
  const slideUp     = useRef(new Animated.Value(30)).current;
  const dotScale1   = useRef(new Animated.Value(0)).current;
  const dotScale2   = useRef(new Animated.Value(0)).current;
  const dotScale3   = useRef(new Animated.Value(0)).current;
  const tagFade     = useRef(new Animated.Value(0)).current;
  const exitFade    = useRef(new Animated.Value(1)).current;
  const exitScale   = useRef(new Animated.Value(1)).current;
  const glowPulse   = useRef(new Animated.Value(0.2)).current;

  // Particles data
  const particles = useRef([
    { x:'10%', y:'15%', size:3, delay:0 },
    { x:'25%', y:'70%', size:2, delay:400 },
    { x:'75%', y:'20%', size:4, delay:200 },
    { x:'85%', y:'60%', size:2, delay:600 },
    { x:'50%', y:'80%', size:3, delay:300 },
    { x:'15%', y:'45%', size:2, delay:800 },
    { x:'65%', y:'40%', size:3, delay:100 },
    { x:'40%', y:'25%', size:2, delay:500 },
    { x:'90%', y:'35%', size:3, delay:700 },
    { x:'30%', y:'55%', size:2, delay:900 },
  ]).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue:0.5, duration:1000, useNativeDriver:true }),
        Animated.timing(glowPulse, { toValue:0.2, duration:1000, useNativeDriver:true }),
      ])
    ).start();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue:1, duration:600, useNativeDriver:true }),
        Animated.spring(scaleAnim, { toValue:1, friction:8, tension:40, useNativeDriver:true }),
        Animated.timing(slideUp,   { toValue:0, duration:600, useNativeDriver:true }),
      ]),
      Animated.stagger(150, [
        Animated.spring(dotScale1, { toValue:1, friction:5, tension:80, useNativeDriver:true }),
        Animated.spring(dotScale2, { toValue:1, friction:5, tension:80, useNativeDriver:true }),
        Animated.spring(dotScale3, { toValue:1, friction:5, tension:80, useNativeDriver:true }),
      ]),
      Animated.timing(tagFade, { toValue:1, duration:400, useNativeDriver:true }),
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(exitFade,  { toValue:0, duration:400, useNativeDriver:true }),
        Animated.timing(exitScale, { toValue:1.1, duration:400, useNativeDriver:true }),
      ]),
    ]).start(() => onFinish());
  }, []);

  const hour  = new Date().getHours();
  const greet = hour<5?'Late Night Owl':hour<12?'Good Morning':hour<17?'Good Afternoon':'Good Evening';

  return (
    <Animated.View style={{
      ...StyleSheet.absoluteFillObject,
      backgroundColor: T.bg,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      opacity: exitFade,
      transform: [{ scale: exitScale }],
    }}>
      {/* Particles background */}
      {particles.map((p, i) => (
        <Particle key={i} x={p.x} y={p.y} size={p.size} delay={p.delay} />
      ))}

      <Animated.View style={{
        alignItems: 'center',
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }, { translateY: slideUp }],
      }}>
        {/* Logo with glow */}
        <View style={{ marginBottom: 28, alignItems:'center' }}>
          <Animated.View style={{
            position:'absolute', width:120, height:120, borderRadius:60,
            backgroundColor: T.accent, opacity: glowPulse,
          }}/>
          <View style={{
            width: 96, height: 96, borderRadius: 48,
            backgroundColor: T.card,
            borderWidth: 2, borderColor: T.aBd,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: T.accent, letterSpacing: -0.5 }}>DJ'</Text>
            <Text style={{ fontSize: 11, fontWeight: '700', color: T.sub, letterSpacing: 2, marginTop: -2 }}>TRACKER</Text>
          </View>
        </View>

        {/* Greeting */}
        <Text style={{
          fontSize: 12, fontWeight: '600', color: T.sub,
          letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8,
        }}>{greet}</Text>

        {/* Name */}
        <Text style={{
          fontSize: 28, fontWeight: '800', color: T.text,
          letterSpacing: -0.5, marginBottom: 4,
        }}>Dhanush Jaddu</Text>

        {/* Tagline */}
        <Animated.Text style={{
          fontSize: 12, color: T.dim, letterSpacing: 0.5,
          opacity: tagFade, marginBottom: 32,
        }}>Track Everything. Stay Consistent.</Animated.Text>

        {/* Loading dots */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[dotScale1, dotScale2, dotScale3].map((dot, i) => (
            <Animated.View key={i} style={{
              width: 6, height: 6, borderRadius: 3,
              backgroundColor: [TAB_COLORS.Home, TAB_COLORS.Expenses, TAB_COLORS.Gym][i],
              transform: [{ scale: dot }],
            }} />
          ))}
        </View>
      </Animated.View>

      {/* Bottom branding */}
      <View style={{ position: 'absolute', bottom: 50, alignItems: 'center' }}>
        <Text style={{ fontSize: 9, color: T.dim, letterSpacing: 1.5 }}>BUILT WITH DISCIPLINE</Text>
      </View>
    </Animated.View>
  );
}

// ── Fade-In Screen Wrapper ───────────────────────────────────
function FadeScreen({ children }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue:1, duration:250, useNativeDriver:true }).start();
  }, []);
  return <Animated.View style={{ flex:1, opacity }}>{children}</Animated.View>;
}

// ── Main ──────────────────────────────────────────────────────
function Main() {
  const [showSplash, setShowSplash] = useState(true);
  const { data, log, upLog, loaded } = useStore();

  const last5  = useCallback(fn => Array.from({length:5}).map((_,i) => {
    const d = new Date(); d.setDate(d.getDate()-(4-i));
    const k = d.toISOString().split('T')[0];
    return { l:i===4?'Today':['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()], v:fn(data.logs[k]) };
  }), [data]);

  const fmtT   = s => {
    const h=String(Math.floor(s/3600)).padStart(2,'0');
    const m=String(Math.floor((s%3600)/60)).padStart(2,'0');
    const sc=String(s%60).padStart(2,'0');
    return `${h}:${m}:${sc}`;
  };

  const totalSt  = (log.sessions||[]).reduce((a,s)=>a+s.dur,0);
  const studyPct = Math.min(100,(totalSt/(data.profile.goal_study*3600))*100);

  // Streak calculation
  const calcStreak = () => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const k = d.toISOString().split('T')[0];
      const dayLog = data.logs[k];
      if (!dayLog) break;
      const hasActivity = (dayLog.steps && parseInt(dayLog.steps) > 0) ||
        (dayLog.sessions && dayLog.sessions.length > 0) ||
        (dayLog.water && dayLog.water > 0) ||
        (dayLog.workouts && dayLog.workouts.length > 0) ||
        (dayLog.mood && dayLog.mood !== '');
      if (hasActivity) streak++;
      else break;
    }
    return streak;
  };
  const streak = calcStreak();

  const shared = { log, upLog, data, last5, T, streak };

  if (!loaded) return (
    <View style={{ flex:1, backgroundColor:T.bg, alignItems:'center', justifyContent:'center' }}>
      <Text style={{ color:T.accent, fontSize:16, fontWeight:'700' }}>Loading...</Text>
    </View>
  );

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <StatusBar barStyle="light-content" backgroundColor={T.bg}/>
      <AppHeader/>
      <NavigationContainer>
        <Tab.Navigator
          tabBar={props => <AppTabBar {...props}/>}
          screenOptions={{ headerShown:false }}>
          <Tab.Screen name="Home">
            {() => <FadeScreen><HomeScreen {...shared} fmtT={fmtT} totalSt={totalSt} studyPct={studyPct}/></FadeScreen>}
          </Tab.Screen>
          <Tab.Screen name="Expenses">
            {() => <FadeScreen><ExpenseScreen {...shared}/></FadeScreen>}
          </Tab.Screen>
          <Tab.Screen name="Gym">
            {() => <FadeScreen><GymScreen {...shared}/></FadeScreen>}
          </Tab.Screen>
          <Tab.Screen name="Diet">
            {() => <FadeScreen><DietScreen {...shared}/></FadeScreen>}
          </Tab.Screen>
          <Tab.Screen name="Habits">
            {() => <FadeScreen><HabitsScreen {...shared}/></FadeScreen>}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Main/>
    </SafeAreaProvider>
  );
}
