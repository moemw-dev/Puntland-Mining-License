"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

import { signUpSchema } from "@/lib/validations"
import { signUp } from "@/lib/actions/auth.action"

type SignUpFormData = {
  name: string
  email: string
  password: string
}

type PasswordRequirements = {
  minLength: boolean
  hasUppercase: boolean
  hasNumber: boolean
  hasSymbol: boolean
}

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSymbol: false,
  })

  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const password = form.watch("password")

  useEffect(() => {
    if (password) {
      setPasswordRequirements({
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      })
    } else {
      setPasswordRequirements({
        minLength: false,
        hasUppercase: false,
        hasNumber: false,
        hasSymbol: false,
      })
    }
  }, [password])

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true) 

    try {
      const result = await signUp(data)

      if (!result.success) {
        if (result.error?.includes("already exists")) {
          form.setError("email", { type: "manual", message: result.error })
        } else {
          toast.error(result.error || "An error occurred during signup")
        }
      } else {
        toast.success("Account created successfully!")
        router.push("/users")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error("Signup error:", error)
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? "text-green-600" : "text-gray-500"}`}>
      {met ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
      <span>{text}</span>
    </div>
  )

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Create Account</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...field}
                      className="pr-10"
                      autoComplete="new-password"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </FormControl>

                {/* Password Requirements */}
                <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-md border">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Password must contain:</p>
                  <div className="space-y-2">
                    <RequirementItem met={passwordRequirements.minLength} text="At least 8 characters" />
                    <RequirementItem met={passwordRequirements.hasUppercase} text="One uppercase letter (A-Z)" />
                    <RequirementItem met={passwordRequirements.hasNumber} text="One number (0-9)" />
                    <RequirementItem met={passwordRequirements.hasSymbol} text="One special character (!@#$%^&*)" />
                  </div>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default SignUpForm
