import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
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
  const [amount, setAmount]   = useState('');
  const [desc, setDesc]       = useState('');
  const [selCat, setSelCat]   = useState('food');
  const [showCats, setShowCats] = useState(false);

  const expenses  = log.expenses || [];
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
  };

  const removeExpense = (id) => {
    upLog({ expenses: expenses.filter(e => e.id !== id) });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}>

      {/* Budget overview hero */}
      <View style={{
        backgroundColor: overBudget ? `${T.red}18` : T.aDim,
        borderWidth: 1,
        borderColor: overBudget ? `${T.red}40` : T.aBd,
        borderRadius: 18, padding: 18, marginBottom: 12,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: overBudget ? T.red : T.accent,
              letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
              {overBudget ? '⚠️ Over Budget' : 'Today\'s Budget'}
            </Text>
            <Text style={{ fontSize: 34, fontWeight: '800', color: T.text, letterSpacing: -1 }}>
              ₹{totalSpent.toLocaleString('en-IN')}
            </Text>
            <Text style={{ fontSize: 11, color: T.sub, marginTop: 4 }}>
              {overBudget
                ? `₹${(totalSpent - budget).toLocaleString('en-IN')} over budget`
                : `₹${remaining.toLocaleString('en-IN')} remaining`}
            </Text>
          </View>
          <Ring T={T} pct={budgetPct} col={overBudget ? T.red : budgetPct > 80 ? T.amber : T.green}
            size={80} sw={7} top={`${Math.round(budgetPct)}%`} bot="spent" />
        </View>
        <PBar T={T} pct={budgetPct} col={overBudget ? T.red : budgetPct > 80 ? T.amber : T.green} h={6} />
        <Text style={{ fontSize: 10, color: T.dim, marginTop: 6, textAlign: 'right' }}>
          Budget: ₹{budget.toLocaleString('en-IN')}/day
        </Text>
      </View>

      {/* Quick add expense */}
      <Card T={T} accent>
        <Lbl T={T} color={T.accent}>Add Expense</Lbl>

        {/* Amount */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: T.accent, marginRight: 4 }}>₹</Text>
          <Field T={T} value={amount}
            onCommit={v => setAmount(v)}
            onChangeText={setAmount}
            keyboardType="decimal-pad" placeholder="0"
            style={{ flex: 1, fontSize: 28, fontWeight: '800', textAlign: 'left',
              backgroundColor: 'transparent', borderWidth: 0, padding: 4 }} />
        </View>

        {/* Category picker */}
        <TouchableOpacity onPress={() => setShowCats(!showCats)}
          style={{
            backgroundColor: T.cardHi, borderWidth: 1, borderColor: T.border,
            borderRadius: 10, padding: 12, marginBottom: 8,
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 18 }}>{getCatMeta(selCat).icon}</Text>
            <Text style={{ color: T.text, fontSize: 14, fontWeight: '500' }}>{getCatMeta(selCat).label}</Text>
          </View>
          <Text style={{ color: T.sub, fontSize: 12 }}>▾</Text>
        </TouchableOpacity>

        {showCats && (
          <View style={{
            backgroundColor: T.card, borderWidth: 1, borderColor: T.border,
            borderRadius: 12, marginBottom: 10, overflow: 'hidden',
          }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat.id}
                onPress={() => { setSelCat(cat.id); setShowCats(false); }}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  padding: 12, borderBottomWidth: 1, borderBottomColor: T.border,
                  backgroundColor: selCat === cat.id ? `${cat.col}18` : 'transparent',
                }}>
                <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                <Text style={{ color: selCat === cat.id ? cat.col : T.text, fontSize: 13, fontWeight: selCat === cat.id ? '600' : '400' }}>
                  {cat.label}
                </Text>
                {selCat === cat.id && (
                  <View style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: 3, backgroundColor: cat.col }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Description */}
        <Field T={T} value={desc}
          onCommit={v => setDesc(v)}
          onChangeText={setDesc}
          placeholder="What was it for?" style={{ marginBottom: 12, fontSize: 13 }} />

        <Btn T={T} col={T.accent} onPress={addExpense} style={{ width: '100%' }}>
          + Add Expense
        </Btn>
      </Card>

      {/* Category breakdown */}
      {Object.keys(catTotals).length > 0 && (
        <Card T={T}>
          <Lbl T={T} right={`${expenses.length} items`}>Spending by Category</Lbl>
          {CATEGORIES.filter(c => catTotals[c.id]).map(cat => {
            const amt = catTotals[cat.id];
            const pct = totalSpent > 0 ? (amt / totalSpent) * 100 : 0;
            return (
              <View key={cat.id} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: T.text }}>{cat.label}</Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: cat.col }}>₹{amt.toLocaleString('en-IN')}</Text>
                </View>
                <PBar T={T} pct={pct} col={cat.col} h={5} />
              </View>
            );
          })}
        </Card>
      )}

      {/* 5-day spending chart */}
      <Card T={T}>
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
          ? <Text style={{ fontSize: 13, color: T.dim, paddingVertical: 8 }}>No expenses yet — add one above.</Text>
          : [...expenses].reverse().map((e, i) => {
            const meta = getCatMeta(e.cat);
            return (
              <TouchableOpacity key={e.id} onLongPress={() => removeExpense(e.id)}
                style={{
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingVertical: 11,
                  borderBottomWidth: i < expenses.length - 1 ? 1 : 0,
                  borderBottomColor: T.border,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: `${meta.col}18`, borderWidth: 1, borderColor: `${meta.col}44`,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 16 }}>{meta.icon}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: T.text }}>{e.desc}</Text>
                    <Text style={{ fontSize: 10, color: T.dim, marginTop: 2 }}>{meta.label} • {e.at}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: meta.col, fontVariant: ['tabular-nums'] }}>
                  -₹{parseFloat(e.amount).toLocaleString('en-IN')}
                </Text>
              </TouchableOpacity>
            );
          })}
        {expenses.length > 0 && (
          <Text style={{ fontSize: 10, color: T.dim, marginTop: 10, textAlign: 'center', fontStyle: 'italic' }}>
            Long-press to remove an expense
          </Text>
        )}
      </Card>
    </ScrollView>
  );
}
