/**
 * @vitest-environment jsdom
 */
import { createRef } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button } from "./button"

describe("Button", () => {
  it("forwards ref to the button element", () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Ref Button</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current).toHaveAttribute("data-slot", "button")
  })

  it("renders with default variant and size", () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole("button", { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute("data-slot", "button")
    expect(button).toHaveClass("bg-primary") // default variant
    expect(button).toHaveClass("h-8") // default size
  })

  it("renders with all variants", () => {
    const variants = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const
    variants.forEach((variant) => {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>)
      const button = screen.getByRole("button", { name: variant })
      if (variant === "default") expect(button).toHaveClass("bg-primary")
      if (variant === "destructive") expect(button).toHaveClass("bg-destructive/10")
      if (variant === "outline") expect(button).toHaveClass("border-border")
      if (variant === "secondary") expect(button).toHaveClass("bg-secondary")
      if (variant === "ghost") expect(button).toHaveClass("hover:bg-muted")
      if (variant === "link") expect(button).toHaveClass("text-primary")
      unmount()
    })
  })

  it("renders with all sizes", () => {
    const sizes = ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"] as const
    sizes.forEach((size) => {
      const { unmount } = render(<Button size={size}>{size}</Button>)
      const button = screen.getByRole("button", { name: size })
      if (size === "default") expect(button).toHaveClass("h-8")
      if (size === "xs") expect(button).toHaveClass("h-6")
      if (size === "sm") expect(button).toHaveClass("h-7")
      if (size === "lg") expect(button).toHaveClass("h-9")
      if (size === "icon") expect(button).toHaveClass("size-8")
      if (size === "icon-xs") expect(button).toHaveClass("size-6")
      if (size === "icon-sm") expect(button).toHaveClass("size-7")
      if (size === "icon-lg") expect(button).toHaveClass("size-9")
      unmount()
    })
  })

  it("applies disabled prop", () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole("button", { name: /disabled/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass("disabled:opacity-50")
  })

  it("merges custom classNames", () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole("button", { name: /custom/i })
    expect(button).toHaveClass("custom-class")
    expect(button).toHaveClass("bg-primary")
  })
})
