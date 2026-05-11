import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Modal } from 'react-native';
import { Card, Lbl, PBar, Bar5, Field, Btn, Ring } from '../components/UI';

const CATEGORIES = [
  { id:'food',      label:'Food & Dining',  icon:'🍔', col:'#f59e0b' },
  { id:'transport', label:'Transport',       icon:'🚗', col:'#38bdf8' },
  { id:'shopping',  label:'Shopping',        icon:'🛍️', col:'#a78bfa' },
  { id:'bills',     label:'Bills & Recharge',icon:'📱', col:'#f43f5e' },
  { id:'entertain', label:'Entertainment',   icon:'🎬', col:'#ec4899' },
  { id:'education', label:'Education',       icon:'📚', col:'#6c63ff' },
  { id:'health',    label:'Health',          icon:'💊', col:'#10b981' },
  { id:'other',     label:'Other',           icon:'📌', col:'#72717a' },
];

function getCatMeta(catId) {
  return CATEGORIES.find(c => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
}

export default function ExpenseScreen({ log, upLog, data, last5, T }) {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount]     = useState('');
  const [desc, setDesc]         = useState('');
  const [selCat, setSelCat]     = useState('food');
  const [showCats, setShowCats] = useState(false);
  const fabScale = useRef(new Animated.Value(1)).current;
  const formSlide = useRef(new Animated.Value(300)).current;

  const expenses   = log.expenses || [];
  const totalSpent = expenses.reduce((a, e) => a + (parseFloat(e.amount) || 0), 0);
  const budget     = data.profile.goal_budget || 500;
  const budgetPct  = Math.min(100, (totalSpent / budget) * 100);
  const remaining  = Math.max(0, budget - totalSpent);
  const overBudget = totalSpent > budget;

  const catTotals = {};
  expenses.forEach(e => {
    catTotals[e.cat] = (catTotals[e.cat] || 0) + (parseFloat(e.amount) || 0);
  });

  const spendD5 = last5(l => (l?.expenses || []).reduce((a, e) => a + (parseFloat(e.amount) || 0), 0));

  const openForm = () => {
    setShowForm(true);
    Animated.spring(formSlide, { toValue:0, friction:8, tension:50, useNativeDriver:true }).start();
    Animated.sequence([
      Animated.timing(fabScale, { toValue:0, duration:150, useNativeDriver:true }),
    ]).start();
  };

  const closeForm = () => {
    Animated.timing(formSlide, { toValue:300, duration:200, useNativeDriver:true }).start(() => {
      setShowForm(false);
      Animated.spring(fabScale, { toValue:1, friction:5, tension:80, useNativeDriver:true }).start();
    });
  };

  const addExpense = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    const newExp = {
      id: Date.now(),
      amount: amt,
      cat: selCat,
      desc: desc.trim() || getCatMeta(selCat).label,
      at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    upLog({ expenses: [...expenses, newExp] });
    setAmount('');
    setDesc('');
    closeForm();
  };

  const removeExpense = (id) => {
    upLog({ expenses: expenses.filter(e => e.id !== id) });
  };

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <ScrollView contentContainerStyle={{ padding:18, paddingBottom:100 }} showsVerticalScrollIndicator={false}>

        {/* Budget overview hero */}
        <View style={{
          backgroundColor: overBudget ? `${T.red}18` : T.aDim,
          borderWidth: 1,
          borderColor: overBudget ? `${T.red}40` : T.aBd,
          borderRadius: 20, padding: 20, marginBottom: 14,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: overBudget ? T.red : T.accent,
                letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                {overBudget ? '⚠️ Over Budget' : 'Today\'s Budget'}
              </Text>
              <Text style={{ fontSize: 36, fontWeight: '800', color: T.text, letterSpacing: -1 }}>
                ₹{totalSpent.toLocaleString('en-IN')}
              </Text>
              <Text style={{ fontSize: 11, color: T.sub, marginTop: 5 }}>
                {overBudget
                  ? `₹${(totalSpent - budget).toLocaleString('en-IN')} over budget`
                  : `₹${remaining.toLocaleString('en-IN')} remaining`}
              </Text>
            </View>
            <Ring T={T} pct={budgetPct} col={overBudget ? T.red : budgetPct > 80 ? T.amber : T.green}
              size={80} sw={7} top={`${Math.round(budgetPct)}%`} bot="spent" />
          </View>
          <View style={{ marginTop:12 }}>
            <PBar T={T} pct={budgetPct} col={overBudget ? T.red : budgetPct > 80 ? T.amber : T.green} h={6} />
          </View>
          <Text style={{ fontSize: 10, color: T.dim, marginTop: 8, textAlign: 'right' }}>
            Budget: ₹{budget.toLocaleString('en-IN')}/day
          </Text>
        </View>

        {/* Category breakdown (analytics) */}
        {Object.keys(catTotals).length > 0 && (
          <Card T={T} style={{ marginBottom:14 }}>
            <Lbl T={T} right={`${expenses.length} items`}>Spending by Category</Lbl>
            {CATEGORIES.filter(c => catTotals[c.id]).map(cat => {
              const amt = catTotals[cat.id];
              const pct = totalSpent > 0 ? (amt / totalSpent) * 100 : 0;
              return (
                <View key={cat.id} style={{ marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: T.text }}>{cat.label}</Text>
                    </View>
                    <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                      <Text style={{ fontSize: 10, color: T.dim }}>{Math.round(pct)}%</Text>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: cat.col }}>₹{amt.toLocaleString('en-IN')}</Text>
                    </View>
                  </View>
                  <PBar T={T} pct={pct} col={cat.col} h={5} />
                </View>
              );
            })}
          </Card>
        )}

        {/* 5-day spending chart */}
        <Card T={T} style={{ marginBottom:14 }}>
          <Lbl T={T} right={`avg ₹${Math.round(spendD5.reduce((a, d) => a + d.v, 0) / 5)}/day`}>
            Spending — 5 Days
          </Lbl>
          <Bar5 T={T} d5={spendD5} maxV={budget} col={T.amber} unit="₹" />
        </Card>

        {/* Today's transactions */}
        <Card T={T}>
          <Lbl T={T} right={totalSpent > 0 ? `₹${totalSpent.toLocaleString('en-IN')}` : ''}>
            Today's Transactions
          </Lbl>
          {expenses.length === 0
            ? <Text style={{ fontSize: 13, color: T.dim, paddingVertical: 10 }}>No expenses yet — tap + to add one.</Text>
            : [...expenses].reverse().map((e, i) => {
              const meta = getCatMeta(e.cat);
              return (
                <TouchableOpacity key={e.id} onLongPress={() => removeExpense(e.id)}
                  style={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    paddingVertical: 13,
                    borderBottomWidth: i < expenses.length - 1 ? 1 : 0,
                    borderBottomColor: T.border,
                  }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{
                      width: 38, height: 38, borderRadius: 12,
                      backgroundColor: `${meta.col}18`, borderWidth: 1, borderColor: `${meta.col}44`,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 17 }}>{meta.icon}</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: T.text }}>{e.desc}</Text>
                      <Text style={{ fontSize: 10, color: T.dim, marginTop: 3 }}>{meta.label} • {e.at}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: meta.col, fontVariant: ['tabular-nums'] }}>
                    -₹{parseFloat(e.amount).toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          {expenses.length > 0 && (
            <Text style={{ fontSize: 10, color: T.dim, marginTop: 12, textAlign: 'center', fontStyle: 'italic' }}>
              Long-press to remove an expense
            </Text>
          )}
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View style={{
        position:'absolute', bottom:24, right:20,
        transform:[{ scale:fabScale }],
      }}>
        <TouchableOpacity onPress={openForm}
          style={{
            width:56, height:56, borderRadius:28,
            backgroundColor:T.accent,
            alignItems:'center', justifyContent:'center',
            shadowColor:'#000', shadowOffset:{width:0,height:4},
            shadowOpacity:0.3, shadowRadius:8, elevation:8,
          }}>
          <Text style={{ fontSize:28, color:'#fff', marginTop:-2 }}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Slide-up add expense form */}
      {showForm && (
        <View style={{
          position:'absolute', top:0, left:0, right:0, bottom:0,
          backgroundColor:'rgba(0,0,0,0.5)',
          justifyContent:'flex-end',
        }}>
          <TouchableOpacity style={{ flex:1 }} activeOpacity={1} onPress={closeForm} />
          <Animated.View style={{
            backgroundColor:T.card,
            borderTopLeftRadius:24, borderTopRightRadius:24,
            padding:24, paddingBottom:40,
            borderWidth:1, borderColor:T.glassBd,
            transform:[{ translateY:formSlide }],
          }}>
            {/* Handle bar */}
            <View style={{ width:40, height:4, borderRadius:2, backgroundColor:T.dim,
              alignSelf:'center', marginBottom:20 }}/>

            <Text style={{ fontSize:16, fontWeight:'700', color:T.text, marginBottom:18 }}>Add Expense</Text>

            {/* Amount */}
            <View style={{ flexDirection:'row', alignItems:'center', marginBottom:14 }}>
              <Text style={{ fontSize:30, fontWeight:'800', color:T.accent, marginRight:6 }}>₹</Text>
              <Field T={T} value={amount}
                onCommit={v => setAmount(v)}
                onChangeText={setAmount}
                keyboardType="decimal-pad" placeholder="0"
                style={{ flex:1, fontSize:30, fontWeight:'800', textAlign:'left',
                  backgroundColor:'transparent', borderWidth:0, padding:4 }} />
            </View>

            {/* Category picker */}
            <TouchableOpacity onPress={() => setShowCats(!showCats)}
              style={{
                backgroundColor:T.cardHi, borderWidth:1, borderColor:T.border,
                borderRadius:12, padding:14, marginBottom:10,
                flexDirection:'row', justifyContent:'space-between', alignItems:'center',
              }}>
              <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
                <Text style={{ fontSize:18 }}>{getCatMeta(selCat).icon}</Text>
                <Text style={{ color:T.text, fontSize:14, fontWeight:'500' }}>{getCatMeta(selCat).label}</Text>
              </View>
              <Text style={{ color:T.sub, fontSize:12 }}>▾</Text>
            </TouchableOpacity>

            {showCats && (
              <View style={{
                backgroundColor:T.cardHi, borderWidth:1, borderColor:T.border,
                borderRadius:12, marginBottom:12, overflow:'hidden',
              }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat.id}
                    onPress={() => { setSelCat(cat.id); setShowCats(false); }}
                    style={{
                      flexDirection:'row', alignItems:'center', gap:12,
                      padding:13, borderBottomWidth:1, borderBottomColor:T.border,
                      backgroundColor: selCat===cat.id ? `${cat.col}18` : 'transparent',
                    }}>
                    <Text style={{ fontSize:16 }}>{cat.icon}</Text>
                    <Text style={{ color: selCat===cat.id ? cat.col : T.text, fontSize:13, fontWeight: selCat===cat.id?'600':'400' }}>
                      {cat.label}
                    </Text>
                    {selCat===cat.id && (
                      <View style={{ marginLeft:'auto', width:6, height:6, borderRadius:3, backgroundColor:cat.col }}/>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Description */}
            <Field T={T} value={desc}
              onCommit={v => setDesc(v)}
              onChangeText={setDesc}
              placeholder="What was it for?" style={{ marginBottom:16, fontSize:13 }} />

            <View style={{ flexDirection:'row', gap:10 }}>
              <Btn T={T} col={T.sub} outline onPress={closeForm} style={{ flex:1 }}>Cancel</Btn>
              <Btn T={T} col={T.accent} onPress={addExpense} style={{ flex:2 }}>Add Expense</Btn>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}
