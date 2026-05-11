import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Platform, Animated, Dimensions, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Polyline, Circle, Line } from 'react-native-svg';

import { darkT, lightT } from './src/theme/colors';
import { useStore } from './src/hooks/useStore';
import HomeScreen    from './src/screens/HomeScreen';
import ExpenseScreen from './src/screens/ExpenseScreen';
import GymScreen     from './src/screens/GymScreen';
import DietScreen    from './src/screens/DietScreen';
import HabitsScreen  from './src/screens/HabitsScreen';

const Tab = createBottomTabNavigator();

// ── Nav icons ─────────────────────────────────────────────────
function HomeIc({c,s})  { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><Polyline points="9 22 9 12 15 12 15 22"/></Svg>; }
function WalletIc({c,s}){ return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><Rect x="2" y="5" width="20" height="15" rx="2"/><Path d="M16 10h4v4h-4z"/><Line x1="2" y1="10" x2="22" y2="10"/></Svg>; }
function GymIc({c,s})   { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><Path d="M6 5v14M18 5v14M4 7h4M16 7h4M4 17h4M16 17h4M2 10h4M18 10h4M2 14h4M18 14h4"/></Svg>; }
function FoodIc({c,s})  { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><Path d="M12 2a7 7 0 017 7c0 3.87-3.13 7-7 7S5 12.87 5 9a7 7 0 017-7z"/><Path d="M12 16v6M9 19h6"/></Svg>; }
function CheckIc({c,s}) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><Rect x="3" y="3" width="7" height="7" rx="1"/><Rect x="14" y="3" width="7" height="7" rx="1"/><Rect x="3" y="14" width="7" height="7" rx="1"/><Polyline points="14 18 16 20 20 15"/></Svg>; }
function SunIc({c})     { return <Svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Circle cx="12" cy="12" r="5"/><Line x1="12" y1="1" x2="12" y2="3"/><Line x1="12" y1="21" x2="12" y2="23"/><Line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><Line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><Line x1="1" y1="12" x2="3" y2="12"/><Line x1="21" y1="12" x2="23" y2="12"/></Svg>; }
function MoonIc({c})    { return <Svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></Svg>; }

// ── Header ────────────────────────────────────────────────────
function AppHeader({ T, dark, setDark }) {
  const insets = useSafeAreaInsets();
  const today  = new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  return (
    <View style={{
      backgroundColor: T.hdrBg || T.bg,
      paddingTop: insets.top + 6,
      paddingBottom: 12,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: T.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    }}>
      <View>
        <View style={{ flexDirection:'row', alignItems:'center', gap:5, marginBottom:2 }}>
          <View style={{ width:6, height:6, borderRadius:3, backgroundColor:T.green }}/>
          <Text style={{ fontSize:9, fontWeight:'700', color:T.green, letterSpacing:1.4 }}>LIVE</Text>
        </View>
        <Text style={{ fontSize:17, fontWeight:'800', color:T.text, letterSpacing:-0.3 }}>Dhanush Jaddu</Text>
        <Text style={{ fontSize:10, color:T.dim, marginTop:1 }}>{today}</Text>
      </View>
      <TouchableOpacity onPress={() => setDark(d => !d)}
        style={{ flexDirection:'row', alignItems:'center', gap:6,
          backgroundColor:T.card, borderWidth:1, borderColor:T.border,
          borderRadius:20, paddingHorizontal:12, paddingVertical:7 }}>
        {dark ? <SunIc c={T.text}/> : <MoonIc c={T.text}/>}
        <Text style={{ fontSize:12, fontWeight:'600', color:T.sub }}>{dark?'Light':'Dark'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Tab Bar ───────────────────────────────────────────────────
function AppTabBar({ state, descriptors, navigation, T }) {
  const insets = useSafeAreaInsets();
  const ICONS  = [HomeIc, WalletIc, GymIc, FoodIc, CheckIc];
  const LABELS = ['Home','Expenses','Gym','Diet','Habits'];
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: T.navBg || T.bg,
      borderTopWidth: 1,
      borderTopColor: T.border,
      paddingTop: 8,
      paddingBottom: insets.bottom + 6,
    }}>
      {state.routes.map((route, idx) => {
        const focused = state.index === idx;
        const Ic = ICONS[idx];
        const col = focused ? T.accent : T.dim;
        return (
          <TouchableOpacity key={route.key} onPress={() => navigation.navigate(route.name)}
            style={{ flex:1, alignItems:'center', gap:4 }}>
            <View style={{ padding:5, borderRadius:10, backgroundColor:focused?T.aDim:'transparent' }}>
              <Ic c={col} s={20}/>
            </View>
            <Text style={{ fontSize:10, fontWeight:focused?'700':'400', color:col, letterSpacing:0.4 }}>{LABELS[idx]}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Splash Screen ─────────────────────────────────────────────
function SplashScreen({ onFinish, T }) {
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const scaleAnim   = useRef(new Animated.Value(0.8)).current;
  const slideUp     = useRef(new Animated.Value(30)).current;
  const dotScale1   = useRef(new Animated.Value(0)).current;
  const dotScale2   = useRef(new Animated.Value(0)).current;
  const dotScale3   = useRef(new Animated.Value(0)).current;
  const tagFade     = useRef(new Animated.Value(0)).current;
  const exitFade    = useRef(new Animated.Value(1)).current;
  const exitScale   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animations
    Animated.sequence([
      // Fade in + scale up the main content
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue:1, duration:600, useNativeDriver:true }),
        Animated.spring(scaleAnim, { toValue:1, friction:8, tension:40, useNativeDriver:true }),
        Animated.timing(slideUp,   { toValue:0, duration:600, useNativeDriver:true }),
      ]),
      // Animate the 3 loading dots one by one
      Animated.stagger(150, [
        Animated.spring(dotScale1, { toValue:1, friction:5, tension:80, useNativeDriver:true }),
        Animated.spring(dotScale2, { toValue:1, friction:5, tension:80, useNativeDriver:true }),
        Animated.spring(dotScale3, { toValue:1, friction:5, tension:80, useNativeDriver:true }),
      ]),
      // Fade in tagline
      Animated.timing(tagFade, { toValue:1, duration:400, useNativeDriver:true }),
      // Hold for a moment
      Animated.delay(800),
      // Exit animation
      Animated.parallel([
        Animated.timing(exitFade,  { toValue:0, duration:400, useNativeDriver:true }),
        Animated.timing(exitScale, { toValue:1.1, duration:400, useNativeDriver:true }),
      ]),
    ]).start(() => onFinish());
  }, []);

  const hour  = new Date().getHours();
  const greet = hour<5?'Late Night Owl':'Good '+(hour<12?'Morning':'Afternoon');

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
      <Animated.View style={{
        alignItems: 'center',
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }, { translateY: slideUp }],
      }}>
        {/* Accent glow circle */}
        <View style={{
          width: 90, height: 90, borderRadius: 45,
          backgroundColor: T.aDim,
          borderWidth: 2, borderColor: T.aBd,
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Text style={{ fontSize: 40 }}>DJ</Text>
        </View>

        {/* Greeting */}
        <Text style={{
          fontSize: 14, fontWeight: '700', color: T.accent,
          letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
        }}>{greet}</Text>

        {/* Name */}
        <Text style={{
          fontSize: 32, fontWeight: '800', color: T.text,
          letterSpacing: -0.5, marginBottom: 6,
        }}>Dhanush Jaddu</Text>

        {/* Tagline */}
        <Animated.Text style={{
          fontSize: 12, color: T.sub, letterSpacing: 0.5,
          opacity: tagFade, marginBottom: 28,
        }}>Track Everything. Stay Consistent.</Animated.Text>

        {/* Loading dots */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[dotScale1, dotScale2, dotScale3].map((dot, i) => (
            <Animated.View key={i} style={{
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: i === 1 ? T.accent : T.aBd,
              transform: [{ scale: dot }],
            }} />
          ))}
        </View>
      </Animated.View>

      {/* Bottom branding */}
      <View style={{ position: 'absolute', bottom: 50, alignItems: 'center' }}>
        <Text style={{ fontSize: 10, color: T.dim, letterSpacing: 1 }}>BUILT WITH DISCIPLINE</Text>
      </View>
    </Animated.View>
  );
}

// ── Main ──────────────────────────────────────────────────────
function Main() {
  const [dark, setDark] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const T = dark ? darkT : lightT;
  const { data, log, upLog, loaded } = useStore();

  const getTK  = () => new Date().toISOString().split('T')[0];
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

  const shared = { log, upLog, data, last5, T };

  if (!loaded) return (
    <View style={{ flex:1, backgroundColor:T.bg, alignItems:'center', justifyContent:'center' }}>
      <Text style={{ color:T.accent, fontSize:16, fontWeight:'700' }}>Loading…</Text>
    </View>
  );

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      {showSplash && <SplashScreen T={T} onFinish={() => setShowSplash(false)} />}
      <StatusBar barStyle={dark?'light-content':'dark-content'} backgroundColor={T.bg}/>
      <AppHeader T={T} dark={dark} setDark={setDark}/>
      <NavigationContainer>
        <Tab.Navigator
          tabBar={props => <AppTabBar {...props} T={T}/>}
          screenOptions={{ headerShown:false }}>
          <Tab.Screen name="Home">
            {() => <HomeScreen {...shared} fmtT={fmtT} totalSt={totalSt} studyPct={studyPct}/>}
          </Tab.Screen>
          <Tab.Screen name="Expenses">
            {() => <ExpenseScreen {...shared}/>}
          </Tab.Screen>
          <Tab.Screen name="Gym">
            {() => <GymScreen {...shared}/>}
          </Tab.Screen>
          <Tab.Screen name="Diet">
            {() => <DietScreen {...shared}/>}
          </Tab.Screen>
          <Tab.Screen name="Habits">
            {() => <HabitsScreen {...shared}/>}
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
