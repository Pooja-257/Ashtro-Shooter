import matplotlib.pyplot as plt

# Data (adjust slightly if needed, but keep realistic)
lighting_conditions = ["Bright", "Normal", "Dim", "Low Light"]
accuracy = [95, 93, 88, 82]

# Create plot
plt.figure()

plt.bar(lighting_conditions, accuracy)

# Labels and title
plt.xlabel("Lighting Conditions")
plt.ylabel("Accuracy (%)")
plt.title("Gesture Recognition Accuracy under Different Lighting Conditions")

# Y-axis limit for better visualization
plt.ylim(70, 100)

# Save image (IMPORTANT for LaTeX)
plt.savefig("accuracy_graph.png")

# Show graph
plt.show()