<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['Todo', 'In Progress', 'Done', 'Pending', 'Cancel'])->default('Todo');
            $table->enum('priority', ['Low', 'Medium', 'High', 'Critical'])->default('Medium');
            $table->unsignedBigInteger('application_id');
            $table->unsignedBigInteger('module_id');
            $table->unsignedBigInteger('sprint_id')->nullable();
            $table->unsignedBigInteger('assigned_to_user_id')->nullable();
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->date('completed_date')->nullable();
            $table->integer('progress')->default(0);
            $table->decimal('est_hours', 8, 2)->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('request_by'); // ubah dari unsignedBigInteger ke string
            $table->timestamp('request_at')->nullable();
            $table->string('request_code')->nullable();
            $table->string('link_issue')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('application_id')->references('id')->on('applications');
            $table->foreign('module_id')->references('id')->on('modules');
            $table->foreign('sprint_id')->references('id')->on('sprints')->nullOnDelete();
            $table->foreign('assigned_to_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('parent_id')->references('id')->on('tasks')->nullOnDelete();
            // Hapus foreign key request_by
            // $table->foreign('request_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
