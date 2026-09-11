from core.orchestrator import app

test_prompt = "I am creating an anti-inflammatory formulation using Cannabis sativa and Ziziphus xylopyrus to cure diabetes."

print("\n🚀 Starting LangGraph Evaluation Engine...\n")
initial_state = {"user_prompt": test_prompt}

# Run the compiled LangGraph application
result = app.invoke(initial_state)

print("\n" + "="*60)
print("🏆 FINAL SYNTHESIZED REPORT")
print("="*60)
print(result["final_report"]["content"])
print("="*60)