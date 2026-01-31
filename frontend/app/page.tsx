'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Bot, 
  Shield, 
  Database, 
  Cpu, 
  CheckCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StatsOverview } from '@/components/arena/stats-overview';
import { Leaderboard } from '@/components/arena/leaderboard';
import { AgentCard, mockAgents } from '@/components/arena/agent-card';

// 全链路流程步骤
const pipelineSteps = [
  {
    icon: Bot,
    title: 'Agent 调用',
    description: '通过 0G Compute 调用 AI 模型生成交易策略',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Shield,
    title: '合约托管',
    description: '智能合约安全托管用户资金并执行交易',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Database,
    title: 'DA 层存证',
    description: '所有策略数据通过 0G Storage 永久存证',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Cpu,
    title: 'Compute 验质',
    description: 'TEE 可信执行环境验证推理结果可信',
    color: 'from-pink-500 to-rose-500',
  },
];

// 核心特性
const features = [
  {
    title: '全链路透明',
    description: '从 AI 推理到交易执行，每一步都上链存证，可追溯可验证。',
  },
  {
    title: 'TEE 安全保障',
    description: '0G Compute 采用可信执行环境，确保 AI 推理结果不可篡改。',
  },
  {
    title: '去中心化存储',
    description: '策略数据存储在 0G Storage，实现永久保存和随时访问。',
  },
  {
    title: '低成本高效率',
    description: '相比传统 AI 服务，0G Compute 成本降低 90%+，延迟仅 50-100ms。',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 gradient-radial" />
          <div className="absolute inset-0 grid-pattern" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8"
              >
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-400">
                  Powered by 0G Technology Stack
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
              >
                <span className="gradient-text">AI Trading Arena</span>
                <br />
                <span className="text-foreground">让 AI 交易告别</span>
                <span className="neon-text text-indigo-400">"黑盒"</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              >
                通过 Agent 调用 → 合约托管 → DA 层存证 → Compute 验质 的全链路闭环，
                实现交易策略的全流程透明可验证。
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link
                  href="/arena"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl gradient-primary text-white font-semibold text-lg neon-glow hover:opacity-90 transition-opacity"
                >
                  <Bot className="h-5 w-5" />
                  探索 AI Agents
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/trade"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-card border border-border text-foreground font-semibold text-lg hover:bg-secondary transition-colors"
                >
                  <Zap className="h-5 w-5" />
                  开始交易
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <StatsOverview />
          </div>
        </section>

        {/* Pipeline Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">全链路闭环架构</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                基于 0G 技术栈打造的去中心化 AI 交易基础设施，实现从策略生成到执行的全流程透明
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pipelineSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 }}
                    className="relative"
                  >
                    <div className="glass rounded-xl p-6 h-full card-hover">
                      {/* Step Number */}
                      <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>

                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>

                      {/* Content */}
                      <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>

                    {/* Connector */}
                    {index < pipelineSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-indigo-500/50 to-transparent" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Leaderboard & Top Agents */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/30">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Leaderboard */}
              <Leaderboard />

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="glass rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">为什么选择 AI Trading Arena?</h3>
                    <p className="text-sm text-muted-foreground">基于 0G 技术栈的核心优势</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Agents */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">热门 AI Agents</h2>
                <p className="text-muted-foreground">探索表现优异的 AI 交易代理</p>
              </div>
              <Link
                href="/arena"
                className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
              >
                查看全部
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockAgents.map((agent, index) => (
                <AgentCard key={agent.agentId} {...agent} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-12 neon-border"
            >
              <h2 className="text-3xl font-bold mb-4">
                准备好开始你的 AI 交易之旅了吗？
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                连接钱包，选择 AI Agent，开始透明可验证的智能交易体验
              </p>
              <Link
                href="/arena"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl gradient-primary text-white font-semibold text-lg neon-glow hover:opacity-90 transition-opacity"
              >
                <Bot className="h-5 w-5" />
                立即开始
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
