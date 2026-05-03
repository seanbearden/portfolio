/**
 * @vitest-environment jsdom
 */
import { createRef } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "./card"

describe("Card", () => {
  it("renders all card components correctly", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText("Title")).toBeInTheDocument()
    expect(screen.getByText("Description")).toBeInTheDocument()
    expect(screen.getByText("Action")).toBeInTheDocument()
    expect(screen.getByText("Content")).toBeInTheDocument()
    expect(screen.getByText("Footer")).toBeInTheDocument()

    expect(document.querySelector('[data-slot="card"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="card-header"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="card-title"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="card-description"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="card-action"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="card-content"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="card-footer"]')).toBeInTheDocument()
  })

  it("applies size props correctly", () => {
    const { rerender } = render(<Card size="default">Default</Card>)
    expect(document.querySelector('[data-slot="card"]')).toHaveAttribute("data-size", "default")

    rerender(<Card size="sm">Small</Card>)
    expect(document.querySelector('[data-slot="card"]')).toHaveAttribute("data-size", "sm")
  })

  it("merges custom classNames", () => {
    render(
      <Card className="custom-card">
        <CardHeader className="custom-header">
          <CardTitle className="custom-title" />
          <CardDescription className="custom-desc" />
          <CardAction className="custom-action" />
        </CardHeader>
        <CardContent className="custom-content" />
        <CardFooter className="custom-footer" />
      </Card>
    )

    expect(document.querySelector('[data-slot="card"]')).toHaveClass("custom-card")
    expect(document.querySelector('[data-slot="card-header"]')).toHaveClass("custom-header")
    expect(document.querySelector('[data-slot="card-title"]')).toHaveClass("custom-title")
    expect(document.querySelector('[data-slot="card-description"]')).toHaveClass("custom-desc")
    expect(document.querySelector('[data-slot="card-action"]')).toHaveClass("custom-action")
    expect(document.querySelector('[data-slot="card-content"]')).toHaveClass("custom-content")
    expect(document.querySelector('[data-slot="card-footer"]')).toHaveClass("custom-footer")
  })

  it("forwards refs to all components", () => {
    const cardRef = createRef<HTMLDivElement>()
    const headerRef = createRef<HTMLDivElement>()
    const titleRef = createRef<HTMLDivElement>()
    const descriptionRef = createRef<HTMLDivElement>()
    const actionRef = createRef<HTMLDivElement>()
    const contentRef = createRef<HTMLDivElement>()
    const footerRef = createRef<HTMLDivElement>()

    render(
      <Card ref={cardRef}>
        <CardHeader ref={headerRef}>
          <CardTitle ref={titleRef} />
          <CardDescription ref={descriptionRef} />
          <CardAction ref={actionRef} />
        </CardHeader>
        <CardContent ref={contentRef} />
        <CardFooter ref={footerRef} />
      </Card>
    )

    expect(cardRef.current).toHaveAttribute("data-slot", "card")
    expect(headerRef.current).toHaveAttribute("data-slot", "card-header")
    expect(titleRef.current).toHaveAttribute("data-slot", "card-title")
    expect(descriptionRef.current).toHaveAttribute("data-slot", "card-description")
    expect(actionRef.current).toHaveAttribute("data-slot", "card-action")
    expect(contentRef.current).toHaveAttribute("data-slot", "card-content")
    expect(footerRef.current).toHaveAttribute("data-slot", "card-footer")
  })
})
