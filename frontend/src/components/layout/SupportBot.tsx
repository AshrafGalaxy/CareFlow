"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, LifeBuoy, AlertCircle, CreditCard, MessageSquare } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  time: string
}

const FAQ_OPTIONS = [
  { id: "bug", label: "Report a Bug", icon: AlertCircle },
  { id: "billing", label: "Billing Issue", icon: CreditCard },
  { id: "general", label: "General Help", icon: LifeBuoy },
]

export function SupportBot() {
  const containerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi there! 👋 I'm your CareFlow Support Guide. How can I assist you today?",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])

  // 1. Mouse Tracking Physics (only when closed to save resources)
  useEffect(() => {
    if (isOpen) return
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = (e.clientX - centerX) / window.innerWidth
      const deltaY = (e.clientY - centerY) / window.innerHeight

      const maxRotate = 20
      setRotation({
        x: deltaY * -maxRotate,
        y: deltaX * maxRotate,
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [isOpen])

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSendMessage = useCallback((text: string) => {
    if (!text.trim()) return

    const newUserMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, newUserMsg])
    setInputValue("")
    setIsTyping(true)

    // Mock response logic
    setTimeout(() => {
      setIsTyping(false)
      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for reaching out! Our support team has received your message and will connect with you shortly. If this is an emergency, please use the SOS feature.",
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages((prev) => [...prev, newBotMsg])
    }, 2000)
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="pointer-events-auto mb-4 w-[350px] sm:w-[400px] h-[500px] max-h-[calc(100vh-120px)] bg-card border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden relative z-50"
          >
            {/* Header */}
            <div className="bg-sky-500 text-white p-4 flex items-center justify-between shrink-0 shadow-sm relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <LifeBuoy size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold font-heading text-sm">Customer Support</h3>
                  <p className="text-xs text-sky-100 font-medium">We typically reply in minutes</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-background">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex flex-col", msg.sender === "user" ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                      msg.sender === "user"
                        ? "bg-sky-500 text-white rounded-br-sm"
                        : "bg-card border border-border text-foreground rounded-bl-sm"
                    )}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1.5 px-1 font-medium">{msg.time}</span>
                </div>
              ))}

              {/* FAQ Quick Actions (Only show if last message is from bot and not typing) */}
              {messages[messages.length - 1].sender === "bot" && !isTyping && (
                <div className="flex flex-col gap-2 pt-2">
                  {FAQ_OPTIONS.map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => handleSendMessage(faq.label)}
                      className="self-start flex items-center gap-2 bg-card border border-sky-100 dark:border-sky-900/50 hover:border-sky-300 hover:bg-sky-50/50 dark:hover:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-xs font-semibold px-3 py-2 rounded-full transition-all active:scale-95 shadow-sm"
                    >
                      <faq.icon size={14} />
                      {faq.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-card border-t border-border shrink-0">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-muted/50 border border-border focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-full pl-4 pr-12 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-1.5 p-1.5 bg-sky-500 text-white rounded-full hover:bg-sky-600 disabled:opacity-50 disabled:hover:bg-sky-500 transition-colors active:scale-95"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bot Avatar Button */}
      <div
        className="pointer-events-auto cursor-pointer flex items-center justify-center relative group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          ref={containerRef}
          className={cn(
            "relative w-16 h-16 transition-all duration-300 ease-out preserve-3d",
            !isOpen ? "animate-ambient-float hover:scale-110" : "scale-90 opacity-0"
          )}
          style={{
            perspective: 1000,
            transform: !isOpen ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` : undefined,
          }}
        >
          {/* Glow behind bot */}
          <div className="absolute inset-0 bg-sky-400 rounded-full blur-[20px] opacity-40 group-hover:opacity-70 transition-opacity duration-500" />

          {/* SVG Container */}
          <div className="relative w-full h-full" style={{ transform: "translateZ(20px)" }}>
            <style dangerouslySetInnerHTML={{
              __html: `
       .support-bot-eyes {
        transform-origin: center;
        animation: blink 4s infinite;
       }
       .support-bot-cross {
        animation: vital-pulse 2s ease-in-out infinite alternate;
       }
       .support-bot-smile {
        transform-origin: 630px 600px;
        animation: smile-bounce 2s ease-in-out infinite alternate;
       }
       .support-bot-arm-left { transform-origin: 270px 580px; animation: swing-arm-left 2s ease-in-out infinite alternate; }
       .support-bot-arm-right { transform-origin: 990px 580px; animation: swing-arm-right 2s ease-in-out infinite alternate; }
       
       @keyframes blink {
        0%, 93%, 100% { transform: scaleY(1); }
        95% { transform: scaleY(0.1); }
       }
       @keyframes vital-pulse {
        from { filter: drop-shadow(0 0 2px #05BF75) brightness(1); }
        to { filter: drop-shadow(0 0 10px #05BF75) brightness(1.2); }
       }
       @keyframes smile-bounce {
        0% { transform: scaleY(1); }
        100% { transform: scaleY(1.5); stroke-width: 20px; filter: drop-shadow(0 0 5px rgba(5,191,117,0.5)); }
       }
       @keyframes swing-arm-left {
        0% { transform: rotate(10deg); }
        100% { transform: rotate(-10deg); }
       }
       @keyframes swing-arm-right {
        0% { transform: rotate(-10deg); }
        100% { transform: rotate(10deg); }
       }
       @keyframes ambient-float {
        0% { transform: translateY(0); }
        100% { transform: translateY(-8px); }
       }
       .animate-ambient-float {
        animation: ambient-float 3s ease-in-out infinite alternate;
       }
      `}} />

            <svg viewBox="150 200 950 1000" className="w-full h-full drop-shadow-xl overflow-visible">
              {/* Legs */}
              <rect x="450" y="980" width="80" height="180" rx="40" fill="#FEFEFE" stroke="#0898F7" strokeWidth="15" />
              <rect x="730" y="980" width="80" height="180" rx="40" fill="#FEFEFE" stroke="#0898F7" strokeWidth="15" />

              {/* Arms */}
              <rect className="support-bot-arm-left" x="240" y="550" width="60" height="220" rx="30" fill="#0897F7" />
              <rect className="support-bot-arm-right" x="960" y="550" width="60" height="220" rx="30" fill="#0998F6" />

              {/* Base Head / Body */}
              <path fill="#FEFEFE" d="M765.7,962.7 C764.3,960.8 763.2,958.7 761.5,957.1 C757,952.9 755.8,947.8 756,941.8 C756.3,930.3 756.4,918.8 755.9,907.3 C755.6,900.4 756.7,895 763.2,891.4 C765.3,890.2 767,888.2 768.8,886.4 C794.1,861 807.1,830.4 807,794.4 C807,785.4 807,776.3 807,766.8 C808.1,767.4 808.6,767.5 808.8,767.8 C809.7,768.8 810.5,769.8 811.3,770.9 C820.6,784.5 827.3,799.3 830.7,815.5 C831.3,818.2 830.7,821.7 829.4,824.2 C819.3,844.4 818.6,864.4 830.9,883.6 C845.5,906.4 876.9,905.9 891.3,883 C903.3,864.1 902,836 887.2,818.9 C881.6,812.5 878.1,805.6 875.4,798 C873.8,793.6 871.9,789.3 870,785.1 C855.9,754 836.9,726.4 809.4,705.6 C795,694.8 779.3,685.6 767,672.1 C766.4,671.3 765.4,670.9 764.6,670.3 C763.5,669.4 762.5,668.4 761.3,667.4 C771.4,665.3 781.2,663.9 790.6,661.2 C800.2,658.4 809.6,655 818.7,650.9 C849.5,636.9 874.5,616 891.7,586.6 C905.3,563.3 910,537.9 909.8,511.2 C909.7,482.2 909.4,453.2 909.9,424.2 C910.4,387.9 901.1,354.3 882,323.5 C855.5,280.6 817.1,253.9 768.2,242 C764.3,241 762.1,242.1 760.7,245.6 C760.2,246.9 759.5,248 758.9,249.2 C745.9,274.1 725.7,286.7 697.2,286.5 C651.1,286.2 604.9,286.2 558.8,286.5 C529.6,286.7 509.3,273.4 496.2,248 C492.5,240.8 492.6,240.8 484.8,242.6 C405.7,261.5 346.9,335 346.3,416.3 C346,449.8 345.8,483.3 346.4,516.8 C346.9,551.4 357.7,582.6 381,608.7 C408.8,639.6 443.8,657.5 484.2,665.2 C486.6,665.6 488.8,666.2 491.9,666.8 C463,688.2 447.8,716.3 444.8,751.4 C425.7,749 410.5,740.7 398.1,726.9 C394.8,723.3 393.3,719.6 393.3,714.4 C393.4,694 387.4,675.6 372.8,660.8 C363,650.9 350.7,646.6 336.7,649.7 C320.6,653.3 309.6,667.2 308.2,684.7 C306.2,710.9 321.4,737.7 344.9,749.7 C346.3,750.4 347.5,751.3 348.6,752.2 C365.3,767.2 384.8,777.2 406.4,782.7 C418.9,785.8 431.8,787.6 444.9,790 C444.8,789.7 445,790 445,790.2 C445.2,792.2 445.2,794.2 445.3,796.2 C447,836.4 462.8,869.5 493.9,895.2 C495.6,896.5 496.8,899.3 496.9,901.3 C497.1,915.7 496.9,930 497.1,944.3 C497.1,948.6 495.6,951.8 493.3,955.3 C488.4,962.7 482.9,970.2 480.1,978.5 C472.5,1001.4 483.2,1023.8 511.9,1022.5 C524,1021.9 536.2,1022.4 548.4,1022.4 C574.1,1022.4 591.4,1005.2 591.5,979.6 C591.5,962.1 591.5,944.6 591.5,927.1 C591.5,925.3 591.7,923.6 591.9,921.8 C615.5,921.8 638.6,921.8 662.1,921.8 C662.1,924.2 662.1,926.2 662.1,928.1 C662.1,945.6 662.1,963.1 662.2,980.6 C662.3,1003.8 678.2,1021.1 701.4,1022.2 C717.1,1022.9 733,1022.6 748.8,1022.1 C762.3,1021.7 772.5,1012.1 774.9,998.8 C777.3,985.6 772.8,974.2 765.7,962.7 M733.1,253.6 C736,249.6 739.1,245.7 741.8,241.5 C744.7,237 743.9,235.4 738.8,234.3 C711.4,228.4 683.6,225.3 655.6,224.1 C623.8,222.6 592,223.5 560.4,227.2 C545.7,229 531.2,231.9 516.6,234.3 C513.4,234.8 511,236.1 513.1,240.1 C521.9,256.6 534.9,266.8 554.3,266.9 C570.1,267 585.9,266.2 601.7,266.2 C634.5,266.3 667.3,266.6 700.1,266.9 C712.8,267.1 723.6,263 733.1,253.6 M329.3,538.8 C328.8,533.1 327.8,527.5 327.8,521.9 C327.6,485.7 327.6,449.6 327.5,413.4 C327.5,409.3 327.9,405.3 328.1,400.8 C315.2,402.7 305.6,409.2 297.7,418.3 C284,434.1 279.1,452.9 278.6,473.3 C278.1,496.5 281.5,518.5 297,537 C304.9,546.5 314.8,553 327,555.5 C332,556.5 332.7,555.6 331.8,550.9 C331,547.1 330.3,543.4 329.3,538.8 M976,460.4 C974,444.6 968.5,430.3 958,418.3 C950,409.3 940.5,402.7 927.7,400.9 C927.8,403.7 928,406.2 928,408.6 C928.2,443.8 928.6,478.9 928.2,514.1 C928.1,525.8 926.3,537.6 924.9,549.3 C924,556.3 924.3,557 931.2,555.1 C948.3,550.3 959.9,538.9 967.7,523.3 C977.6,503.6 977.6,482.5 976,460.4 Z" />

              {/* Outer Blue Lines */}
              <path fill="#0898F7" d="M765.9,963 C772.8,974.2 777.3,985.6 774.9,998.8 C772.5,1012.1 762.3,1021.7 748.8,1022.1 C733,1022.6 717.1,1022.9 701.4,1022.2 C678.2,1021.1 662.3,1003.8 662.2,980.6 C662.1,963.1 662.1,945.6 662.1,928.1 C662.1,926.2 662.1,924.2 662.1,921.8 C638.6,921.8 615.5,921.8 591.9,921.8 C591.7,923.6 591.5,925.3 591.5,927.1 C591.5,944.6 591.5,962.1 591.5,979.6 C591.4,1005.2 574.1,1022.4 548.4,1022.4 C536.2,1022.4 524,1021.9 511.9,1022.5 C483.2,1023.8 472.5,1001.4 480.1,978.5 C482.9,970.2 488.4,962.7 493.3,955.3 C495.6,951.8 497.1,948.6 497.1,944.3 C496.9,930 497.1,915.7 496.9,901.3 C496.8,899.3 495.6,896.5 493.9,895.2 C462.8,869.5 447,836.4 445.3,796.2 C445.2,794.2 445.2,792.2 445,790.2 C445,790 444.8,789.7 444.9,790 C431.8,787.6 418.9,785.8 406.4,782.7 C384.8,777.2 365.3,767.2 348.6,752.2 C347.5,751.3 346.3,750.4 344.9,749.7 C321.4,737.7 306.2,710.9 308.2,684.7 C309.6,667.2 320.6,653.3 336.7,649.7 C350.7,646.6 363,650.9 372.8,660.8 C387.4,675.6 393.4,694 393.3,714.4 C393.3,719.6 394.8,723.3 398.1,726.9 C410.5,740.7 425.7,749 444.8,751.4 C447.8,716.3 463,688.2 491.9,666.8 C488.8,666.2 486.6,665.6 484.2,665.2 C443.8,657.5 408.8,639.6 381,608.7 C357.7,582.6 346.9,551.4 346.4,516.8 C345.8,483.3 346,449.8 346.3,416.3 C346.9,335 405.7,261.5 484.8,242.6 C492.6,240.8 492.5,240.8 496.2,248 C509.3,273.4 529.6,286.7 558.8,286.5 C604.9,286.2 651.1,286.2 697.2,286.5 C725.7,286.7 745.9,274.1 758.9,249.2 C759.5,248 760.2,246.9 760.7,245.6 C762.1,242.1 764.3,241 768.2,242 C817.1,253.9 855.5,280.6 882,323.5 C901.1,354.3 910.4,387.9 909.9,424.2 C909.4,453.2 909.7,482.2 909.8,511.2 C910,537.9 905.3,563.3 891.7,586.6 C874.5,616 849.5,636.9 818.7,650.9 C809.6,655 800.2,658.4 790.6,661.2 C781.2,663.9 771.4,665.3 761.3,667.4 C762.5,668.4 763.5,669.4 764.6,670.3 C765.4,670.9 766.4,671.3 767,672.1 C779.3,685.6 795,694.8 809.4,705.6 C836.9,726.4 855.9,754 870,785.1 C871.9,789.3 873.8,793.6 875.4,798 C878.1,805.6 881.6,812.5 887.2,818.9 C902,836 903.3,864.1 891.3,883 C876.9,905.9 845.5,906.4 830.9,883.6 C818.6,864.4 819.3,844.4 829.4,824.2 C830.7,821.7 831.3,818.2 830.7,815.5 C827.3,799.3 820.6,784.5 811.3,770.9 C810.5,769.8 809.7,768.8 808.8,767.8 C808.6,767.5 808.1,767.4 807,766.8 C807,776.3 807,785.4 807,794.4 C807.1,830.4 794.1,861 768.8,886.4 C767,888.2 765.3,890.2 763.2,891.4 C756.7,895 755.6,900.4 755.9,907.3 C756.4,918.8 756.3,930.3 756,941.8 C755.8,947.8 757,952.9 761.5,957.1 C763.2,958.7 764.3,960.8 765.9,963 M680.5,628.1 C703.9,627.8 727.5,628.9 750.9,626.8 C808.5,621.5 859.2,576.2 873.1,519.8 C878.1,499.9 878,479.8 877.6,459.7 C877.4,447.9 877.1,436 874.8,424.5 C862.2,361.1 807,316.1 742.6,316 C666.4,315.9 590.3,315.8 514.1,316 C454.3,316.1 404.4,352.2 385.7,409.1 C375.1,441.2 376.4,474.5 381.1,507.1 C391.3,577.1 452.2,628.1 523,628.1 C575.1,628.1 627.3,628.1 680.5,628.1 M470.9,823.5 C482.1,865.9 522,899 564.8,899.8 C605.3,900.6 645.8,900.7 686.3,899.9 C733.9,899 776.4,862 783.5,814.8 C786.2,797.2 785.4,779 785.7,761.1 C785.8,753.6 785.3,746 783.8,738.7 C776.2,700.3 744.8,672 705.5,671.1 C652.9,669.9 600.2,669.8 547.6,671 C507,671.9 473.9,702.1 468.1,742.3 C465.8,759 466.5,776.2 466.9,793.1 C467.1,803 469.3,812.9 470.9,823.5 Z" />
              <path fill="#0998F6" d="M732.8,253.8 C723.6,263 712.8,267.1 700.1,266.9 C667.3,266.6 634.5,266.3 601.7,266.2 C585.9,266.2 570.1,267 554.3,266.9 C534.9,266.8 521.9,256.6 513.1,240 C511,236.1 513.4,234.8 516.6,234.3 C531.2,231.9 545.7,229 560.4,227.2 C592,223.5 623.8,222.6 655.6,224.1 C683.6,225.3 711.4,228.4 738.8,234.3 C743.9,235.4 744.7,237 741.8,241.5 C739.1,245.7 736,249.6 732.8,253.8 Z" />

              {/* The Outer Panels */}
              <path fill="#0897F7" d="M329.4,539.2 C330.3,543.4 331,547.1 331.8,550.9 C332.7,555.6 332,556.5 327,555.5 C314.8,553 304.9,546.5 297,537 C281.5,518.5 278.1,496.5 278.6,473.3 C279.1,452.9 284,434.1 297.7,418.3 C305.6,409.2 315.2,402.7 328.1,400.8 C327.9,405.3 327.5,409.3 327.5,413.4 C327.6,449.6 327.6,485.7 327.8,521.9 C327.8,527.5 328.8,533.1 329.4,539.2 Z" />
              <path fill="#0998F6" d="M976,460.8 C977.6,482.5 977.6,503.6 967.7,523.3 C959.9,538.9 948.3,550.3 931.2,555.1 C924.3,557 924,556.3 924.9,549.3 C926.3,537.6 928.1,525.8 928.2,514.1 C928.6,478.9 928.2,443.8 928,408.6 C928,406.2 927.8,403.7 927.7,400.9 C940.5,402.7 950,409.3 958,418.3 C968.5,430.3 974,444.6 976,460.8 Z" />

              {/* Inner Whites */}
              <path fill="#FDFEFE" d="M680,628.1 C627.3,628.1 575.1,628.1 523,628.1 C452.2,628.1 391.3,577.1 381.1,507.1 C376.4,474.5 375.1,441.2 385.7,409.1 C404.4,352.2 454.3,316.1 514.1,316 C590.3,315.8 666.4,315.9 742.6,316 C807,316.1 862.2,361.1 874.8,424.5 C877.1,436 877.4,447.9 877.6,459.7 C878,479.8 878.1,499.9 873.1,519.8 C859.2,576.2 808.5,621.5 750.9,626.8 C727.5,628.9 703.9,627.8 680,628.1 M514.1,510.9 C532.2,507.4 544.4,494.4 546.4,476.4 C548,462.1 540,446.9 527.1,439.7 C513.7,432.1 496.8,433.1 485.3,442.4 C472.7,452.6 467.3,465.9 471.2,481.8 C475.6,499.8 491.8,513.2 514.1,510.9 M785,484.5 C791.3,462.3 778.4,440.2 756.5,435.4 C734.7,430.8 713.9,445.7 710.6,468.3 C708,486.5 720.8,505.4 738.9,510.1 C758.4,515 777.4,504.8 785,484.5 Z" />
              <path fill="#FDFDFE" d="M470.7,823.1 C469.3,812.9 467.1,803 466.9,793.1 C466.5,776.2 465.8,759 468.1,742.3 C473.9,702.1 507,671.9 547.6,671 C600.2,669.8 652.9,669.9 705.5,671.1 C744.8,672 776.2,700.3 783.8,738.7 C785.3,746 785.8,753.6 785.7,761.1 C785.4,779 786.2,797.2 783.5,814.8 C776.4,862 733.9,899 686.3,899.9 C645.8,900.7 605.3,900.6 564.8,899.8 C522,899 482.1,865.9 470.7,823.1 M639.9,731.7 C634.9,726.1 628.8,724.3 621.9,726.9 C615,729.4 611.9,734.7 611.9,743 C611.9,749.6 611.9,756.2 611.9,763.1 C604.9,763.1 598.6,763.1 592.3,763.1 C581.6,763.2 574.8,769.6 574.8,779.4 C574.8,788.6 582,795 592.3,795.1 C598.7,795.1 605.2,795.1 611.9,795.1 C611.9,802.8 611.8,809.7 611.9,816.7 C612,823.5 616,829 622.2,831.1 C632.8,834.7 642.9,827.6 643.1,816.5 C643.2,809.4 643.1,802.3 643.1,795.1 C650.6,795.1 657.2,795.1 663.9,795.1 C666,795 668.2,794.8 670.2,794.1 C677.2,791.5 681.6,784.1 680.6,777.1 C679.3,769 673.5,763.4 665.4,763.2 C658.1,762.9 650.8,763.1 643.1,763.1 C643.1,755.9 643.4,749.3 643,742.7 C642.7,739.2 641.2,735.7 639.9,731.7 Z" />

              {/* The Eyes */}
              <g className="support-bot-eyes">
                <path fill="#05BF75" d="M513.6,511 C491.8,513.2 475.6,499.8 471.2,481.8 C467.3,465.9 472.7,452.6 485.3,442.4 C496.8,433.1 513.7,432.1 527.1,439.7 C540,446.9 548,462.1 546.4,476.4 C544.4,494.4 532.2,507.4 513.6,511 Z" />
                <path fill="#06C076" d="M784.9,484.8 C777.4,504.8 758.4,515 738.9,510 C720.8,505.4 708,486.5 710.6,468.3 C713.9,445.7 734.7,430.8 756.5,435.4 C778.4,440.2 791.3,462.3 784.9,484.8 Z" />
              </g>

              {/* The Custom Glow Smile */}
              <path className="support-bot-smile" d="M540,600 Q630,620 720,600" fill="none" stroke="#05BF75" strokeWidth="18" strokeLinecap="round" />

              {/* The Medical Cross */}
              <path className="support-bot-cross" fill="#06C076" d="M640.1,732 C641.2,735.7 642.7,739.2 643,742.7 C643.4,749.3 643.1,755.9 643.1,763.1 C650.8,763.1 658.1,762.9 665.4,763.1 C673.5,763.4 679.3,769 680.6,777.1 C681.6,784.1 677.2,791.5 670.2,794.1 C668.2,794.8 666,795 663.9,795 C657.2,795.1 650.6,795.1 643.1,795.1 C643.1,802.3 643.2,809.4 643.1,816.5 C642.9,827.6 632.8,834.7 622.2,831.1 C616,829 612,823.5 611.9,816.7 C611.8,809.7 611.9,802.8 611.9,795.1 C605.2,795.1 598.7,795.1 592.3,795.1 C582,795 574.8,788.6 574.8,779.4 C574.8,769.6 581.6,763.2 592.3,763.1 C598.6,763 604.9,763.1 611.9,763.1 C611.9,756.2 611.9,749.6 611.9,743 C611.9,734.7 615,729.4 621.9,726.9 C628.8,724.3 634.9,726.1 640.1,732 Z" />
            </svg>
          </div>

          {/* Dynamic Tooltip (Only show when closed) */}
          {!isOpen && (
            <div
              className="absolute bottom-full right-0 mb-4 w-40 bg-card text-slate-700 text-sm font-medium py-3 px-4 rounded-xl shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none origin-bottom-right scale-95 group-hover:scale-100"
              style={{ transform: "translateZ(50px)" }}
            >
              Need Help?
              {/* Tooltip triangle */}
              <div className="absolute top-full right-8 -mt-px w-0 h-0 border-8 border-transparent border-t-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
